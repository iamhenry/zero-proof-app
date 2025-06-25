/**
 * FILE: lib/interfaces/IDeepLinkService.ts
 * PURPOSE: Defines the contract for deep link processing services, including URL parsing and routing
 * FUNCTIONS:
 *   - handleDeepLink(url: string) → Promise<void>: Processes incoming deep link URLs and routes them to appropriate handlers
 *   - parseVerificationUrl(url: string) → DeepLinkData | null: Extracts verification data from deep link URLs, returns null for invalid URLs
 *   - registerDeepLinkListener() → void: Sets up application-wide deep link event listener for incoming URLs
 *   - unregisterDeepLinkListener() → void: Removes deep link event listener to prevent memory leaks
 * DEPENDENCIES: DeepLinkTypes
 */

import { DeepLinkData } from '../types/DeepLinkTypes';

/**
 * Interface for deep link processing services
 */
export interface IDeepLinkService {
  /**
   * Handles incoming deep link URLs and routes them appropriately
   * @param url - The deep link URL to process
   */
  handleDeepLink(url: string): Promise<void>;

  /**
   * Parses a verification deep link URL to extract relevant data
   * @param url - The deep link URL to parse
   * @returns Parsed deep link data or null if invalid
   */
  parseVerificationUrl(url: string): DeepLinkData | null;

  /**
   * Registers the deep link listener for the application
   */
  registerDeepLinkListener(): void;

  /**
   * Unregisters the deep link listener
   */
  unregisterDeepLinkListener(): void;
}