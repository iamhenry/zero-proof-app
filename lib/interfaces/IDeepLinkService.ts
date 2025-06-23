/**
 * FILE: lib/interfaces/IDeepLinkService.ts
 * PURPOSE: Defines the contract for deep link processing services, including URL parsing and routing
 * FUNCTIONS: Interface definitions for deep link handling
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