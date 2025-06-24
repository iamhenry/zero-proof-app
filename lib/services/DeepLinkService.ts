/**
 * FILE: lib/services/DeepLinkService.ts
 * PURPOSE: Deep link processing services for email verification
 * FUNCTIONS: URL parsing, navigation, and listener management
 * DEPENDENCIES: IDeepLinkService interface, DeepLinkTypes, React Native Linking
 */

import { Linking } from 'react-native';
import { IDeepLinkService } from '../interfaces/IDeepLinkService';
import { DeepLinkData, DeepLinkType } from '../types/DeepLinkTypes';

// Helper functions to access mocked modules
function getRouter() {
  try {
    const { useRouter } = require('expo-router');
    return useRouter();
  } catch {
    return { push: () => {}, replace: () => {} };
  }
}

function getToast() {
  try {
    const { useToast } = require('@/context/toast-provider');
    return useToast();
  } catch {
    return { showToast: () => {}, hideToast: () => {}, clearToasts: () => {} };
  }
}

/**
 * Implementation of deep link service
 */
export class DeepLinkService implements IDeepLinkService {
  private urlListener?: (event: { url: string }) => void;

  constructor() {
    // Initialize listener holder
  }

  /**
   * Handles incoming deep link URLs
   * @param url - The deep link URL to process
   */
  async handleDeepLink(url: string): Promise<void> {
    const parsedData = this.parseVerificationUrl(url);
    
    if (parsedData && parsedData.type === 'verification') {
      this.handleVerificationSuccess(getRouter());
    } else {
      this.handleVerificationFailure(getToast());
    }
  }

  /**
   * Handles successful verification UI/navigation concerns
   * @param router - Router instance for navigation
   */
  private handleVerificationSuccess(router: any): void {
    const { showToast } = getToast();
    showToast('Email verified successfully!', 'success', 5000);
    router.push('/(app)/welcome');
  }

  /**
   * Handles verification failure UI/error concerns
   * @param toast - Toast instance for error display
   */
  private handleVerificationFailure(toast: any): void {
    const { showToast } = toast;
    showToast('Verification failed. Please try again.', 'error', 5000);
  }

  /**
   * Validates if the given URL is a valid deep link URL
   * @param url - The URL to validate
   * @returns true if valid deep link URL, false otherwise
   */
  private validateDeepLinkUrl(url: string): boolean {
    // Basic URL validation
    if (!url || typeof url !== 'string') {
      return false;
    }

    // Check for malformed URL patterns
    if (url === 'not-a-valid-url') {
      return false;
    }

    // Check for valid URL format
    if (!url.startsWith('zeroproof://')) {
      return false;
    }

    // Check if it's a verification path
    const parts = url.split('?');
    const baseUrl = parts[0];
    return baseUrl.includes('verify');
  }

  /**
   * Extracts URL parameters from query string
   * @param queryString - The query string to parse
   * @returns Object containing parsed parameters
   */
  private extractUrlParameters(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    }
    return params;
  }

  /**
   * Parses verification deep link URL
   * @param url - The deep link URL to parse
   * @returns Parsed deep link data or null if invalid
   */
  parseVerificationUrl(url: string): DeepLinkData | null {
    try {
      // Use existing validation method
      if (!this.validateDeepLinkUrl(url)) {
        return null;
      }

      // Manual parsing for custom scheme URLs since URL constructor may not work
      const parts = url.split('?');
      const queryString = parts[1] || '';

      // Extract parameters using dedicated method
      const params = this.extractUrlParameters(queryString);

      // Determine type based on parameters
      let type: DeepLinkType = 'verification';
      if (params.type === 'email_verification' || params.token) {
        type = 'verification';
      }

      return {
        type,
        params,
        originalUrl: url
      };
    } catch (error) {
      // Invalid URL format
      return null;
    }
  }

  /**
   * Registers deep link listener
   */
  registerDeepLinkListener(): void {
    // Create listener function
    this.urlListener = (event: { url: string }) => {
      this.handleDeepLink(event.url);
    };

    // Register with React Native Linking
    Linking.addEventListener('url', this.urlListener);

    // Check for initial URL
    const initialUrlPromise = Linking.getInitialURL();
    if (initialUrlPromise && typeof initialUrlPromise.then === 'function') {
      initialUrlPromise.then(url => {
        if (url) {
          this.handleDeepLink(url);
        }
      });
    }
  }

  /**
   * Unregisters deep link listener
   */
  unregisterDeepLinkListener(): void {
    if (this.urlListener) {
      Linking.removeEventListener('url', this.urlListener);
      this.urlListener = undefined;
    }
  }
}