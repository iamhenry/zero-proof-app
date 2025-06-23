/**
 * FILE: lib/services/DeepLinkService.ts
 * PURPOSE: Stub implementation for deep link processing services
 * FUNCTIONS: Minimal stub methods for deep link handling - NO BUSINESS LOGIC
 * DEPENDENCIES: IDeepLinkService interface, DeepLinkTypes
 */

import { IDeepLinkService } from '../interfaces/IDeepLinkService';
import { DeepLinkData } from '../types/DeepLinkTypes';

/**
 * Stub implementation of deep link service
 * ALL METHODS ARE STUBS - NO BUSINESS LOGIC IMPLEMENTED
 */
export class DeepLinkService implements IDeepLinkService {
  constructor() {
    // Empty constructor - no initialization logic
  }

  /**
   * STUB: Handles incoming deep link URLs
   * @param url - The deep link URL to process
   */
  async handleDeepLink(url: string): Promise<void> {
    console.warn(`STUB: DeepLinkService.handleDeepLink(${url}) called - NOT IMPLEMENTED`);
    return undefined;
  }

  /**
   * STUB: Parses verification deep link URL
   * @param url - The deep link URL to parse
   * @returns Always returns null (stub behavior)
   */
  parseVerificationUrl(url: string): DeepLinkData | null {
    console.warn(`STUB: DeepLinkService.parseVerificationUrl(${url}) called - NOT IMPLEMENTED`);
    return null;
  }

  /**
   * STUB: Registers deep link listener
   */
  registerDeepLinkListener(): void {
    console.warn('STUB: DeepLinkService.registerDeepLinkListener() called - NOT IMPLEMENTED');
    // Empty implementation
  }

  /**
   * STUB: Unregisters deep link listener
   */
  unregisterDeepLinkListener(): void {
    console.warn('STUB: DeepLinkService.unregisterDeepLinkListener() called - NOT IMPLEMENTED');
    // Empty implementation
  }
}