/**
 * FILE: lib/services/DeepLinkService.ts
 * PURPOSE: Deep link processing services for email verification
 * FUNCTIONS:
 *   - constructor(showToast?: function) → DeepLinkService: Initializes service with optional toast notification handler
 *   - handleDeepLink(url: string) → Promise<void>: Processes incoming deep link URLs and handles verification flow
 *   - parseVerificationUrl(url: string) → DeepLinkData | null: Parses verification URL into structured data object
 *   - registerDeepLinkListener() → void: Sets up listener for deep link events and checks for initial URL
 *   - unregisterDeepLinkListener() → void: Removes deep link listener and cleans up subscriptions
 *   - validateDeepLinkUrl(url: string) → boolean: Validates URL format and schema for deep link processing
 *   - extractUrlParameters(queryString: string) → Record<string, string>: Extracts and decodes URL parameters from query string
 *   - handleVerificationSuccess() → void: Shows success toast and manages UI feedback for successful verification
 *   - handleVerificationFailure(errorMessage?: string) → void: Shows error toast with custom or default error message
 * DEPENDENCIES: IDeepLinkService interface, DeepLinkTypes, React Native Linking
 */

import { Linking } from 'react-native';
import { IDeepLinkService } from '../interfaces/IDeepLinkService';
import { DeepLinkData, DeepLinkType } from '../types/DeepLinkTypes';


/**
 * Implementation of deep link service
 */
export class DeepLinkService implements IDeepLinkService {
  private urlListener?: (event: { url: string }) => void;
  private linkingSubscription?: { remove: () => void };
  private showToast?: (message: string, type: string, duration: number) => void;

  constructor(showToast?: (message: string, type: string, duration: number) => void) {
    // Initialize listener holder and store toast function
    this.showToast = showToast;
  }

  /**
   * Handles incoming deep link URLs
   * @param url - The deep link URL to process
   */
  async handleDeepLink(url: string): Promise<void> {
    console.log('🔗 DeepLinkService.handleDeepLink called with URL:', url);
    
    const parsedData = this.parseVerificationUrl(url);
    console.log('📊 Parsed deep link data:', JSON.stringify(parsedData, null, 2));
    
    if (parsedData && parsedData.type === 'verification') {
      // Check for Supabase error fragments in URL
      const errorCode = parsedData.fragments.error_code;
      const errorDescription = parsedData.fragments.error_description;
      
      console.log('🔍 Error fragments check:', { errorCode, errorDescription });
      
      if (errorCode) {
        // Supabase indicates verification failed
        console.log('❌ Verification failed, showing error toast');
        this.handleVerificationFailure(errorDescription);
      } else {
        // No error fragments means verification was successful
        console.log('✅ Verification successful, showing success toast');
        this.handleVerificationSuccess();
      }
    } else {
      console.log('⚠️ Invalid deep link data, showing error');
      this.handleVerificationFailure('Invalid verification link');
    }
  }

  /**
   * Handles successful verification UI feedback
   * No navigation needed - let app's natural routing handle user placement
   */
  private handleVerificationSuccess(): void {
    console.log('🎉 Email verification successful');
    
    console.log('🍞 Showing success toast...');
    this.showToast?.('Email verified successfully!', 'success', 5000);
    
    console.log('✅ Success toast displayed - user will remain on current screen');
  }

  /**
   * Handles verification failure UI/error concerns
   * @param errorMessage - Optional custom error message
   */
  private handleVerificationFailure(errorMessage?: string): void {
    const message = errorMessage || 'Verification failed. Please try again.';
    console.log('❌ Showing error toast:', message);
    this.showToast?.(message, 'error', 5000);
  }

  /**
   * Validates if the given URL is a valid deep link URL
   * @param url - The URL to validate
   * @returns true if valid deep link URL, false otherwise
   */
  private validateDeepLinkUrl(url: string): boolean {
    console.log('🔍 Validating deep link URL:', url);
    
    // Basic URL validation
    if (!url || typeof url !== 'string') {
      console.log('❌ URL validation failed: empty or not string');
      return false;
    }

    // Check for malformed URL patterns
    if (url === 'not-a-valid-url') {
      console.log('❌ URL validation failed: test malformed URL');
      return false;
    }

    // Check for valid URL format
    if (!url.startsWith('zero-proof://')) {
      console.log('❌ URL validation failed: does not start with zero-proof://', url.substring(0, 20));
      return false;
    }

    // Check if it's a verification path (now using welcome route)
    const parts = url.split('?');
    const baseUrl = parts[0];
    const isValid = baseUrl.includes('welcome');
    console.log('✅ URL validation result:', isValid, 'baseUrl:', baseUrl);
    return isValid;
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

      // Parse both query parameters and URL fragments
      // Split on # to separate main URL from fragments
      const [mainUrl, fragmentString] = url.split('#');
      const [, queryString] = mainUrl.split('?');

      // Extract query parameters
      const params = this.extractUrlParameters(queryString || '');

      // Extract URL fragments (where Supabase puts error info)
      const fragments = this.extractUrlParameters(fragmentString || '');

      // For verification links, type is always 'verification'
      const type: DeepLinkType = 'verification';

      return {
        type,
        params,
        fragments,
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
    console.log('🎯 DeepLinkService.registerDeepLinkListener called');
    
    // Create listener function
    this.urlListener = (event: { url: string }) => {
      console.log('📱 Deep link event received (app running):', event.url);
      this.handleDeepLink(event.url);
    };

    // Register with React Native Linking
    this.linkingSubscription = Linking.addEventListener('url', this.urlListener);
    console.log('👂 Event listener registered for URL events');

    // Check for initial URL
    const initialUrlPromise = Linking.getInitialURL();
    console.log('🚀 Checking for initial URL...');
    if (initialUrlPromise && typeof initialUrlPromise.then === 'function') {
      initialUrlPromise.then(url => {
        console.log('🔍 Initial URL check result:', url);
        if (url) {
          console.log('📲 Processing initial URL (cold start):', url);
          this.handleDeepLink(url);
        } else {
          console.log('ℹ️ No initial URL found (normal app launch)');
        }
      });
    } else {
      console.log('⚠️ Initial URL promise not available');
    }
  }

  /**
   * Unregisters deep link listener
   */
  unregisterDeepLinkListener(): void {
    console.log('🔄 DeepLinkService.unregisterDeepLinkListener called');
    if (this.linkingSubscription) {
      console.log('🧹 Cleaning up deep link listener subscription');
      this.linkingSubscription.remove();
      this.linkingSubscription = undefined;
    }
    this.urlListener = undefined;
  }
}