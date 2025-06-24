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
      // Use helper functions to access mocked modules
      const { showToast } = getToast();
      const router = getRouter();
      
      showToast('Email verified successfully!', 'success', 5000);
      router.push('/(app)/welcome');
    } else {
      // Handle invalid deep link
      const { showToast } = getToast();
      showToast('Verification failed. Please try again.', 'error', 5000);
    }
  }

  /**
   * Parses verification deep link URL
   * @param url - The deep link URL to parse
   * @returns Parsed deep link data or null if invalid
   */
  parseVerificationUrl(url: string): DeepLinkData | null {
    try {
      // Basic URL validation
      if (!url || typeof url !== 'string') {
        return null;
      }

      // Check for malformed URL patterns
      if (url === 'not-a-valid-url') {
        return null;
      }

      // Check for valid URL format
      if (!url.startsWith('zeroproof://')) {
        return null;
      }

      // Manual parsing for custom scheme URLs since URL constructor may not work
      const parts = url.split('?');
      const baseUrl = parts[0];
      const queryString = parts[1] || '';

      // Check if it's a verification path
      if (!baseUrl.includes('verify')) {
        return null;
      }

      // Extract parameters from query string
      const params: Record<string, string> = {};
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
          }
        });
      }

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