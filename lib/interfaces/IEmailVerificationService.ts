/**
 * FILE: lib/interfaces/IEmailVerificationService.ts
 * PURPOSE: Defines the contract for email verification services using Supabase
 * FUNCTIONS:
 *   - verifyEmailToken(token: string) → Promise<VerificationResult>: Verifies an email token with Supabase authentication service
 *   - updateVerificationStatus() → Promise<boolean>: Updates the user's verification status in the system after successful verification
 *   - parseVerificationToken(token: string) → VerificationToken | null: Extracts and validates a verification token from parsed deep link data
 *   - isTokenExpired(token: VerificationToken) → boolean: Checks if a verification token is expired based on timestamp validation
 * DEPENDENCIES: DeepLinkTypes
 */

import { VerificationResult, VerificationToken } from '../types/DeepLinkTypes';

/**
 * Interface for email verification services
 */
export interface IEmailVerificationService {
  /**
   * Verifies an email token with Supabase
   * @param token - The verification token from the deep link
   * @returns Promise resolving to verification result
   */
  verifyEmailToken(token: string): Promise<VerificationResult>;

  /**
   * Updates the user's verification status in the system
   * @returns Promise resolving to success status
   */
  updateVerificationStatus(): Promise<boolean>;

  /**
   * Extracts and validates a verification token from parsed deep link data
   * @param token - Raw token string from URL
   * @returns Validated verification token or null if invalid
   */
  parseVerificationToken(token: string): VerificationToken | null;

  /**
   * Checks if a verification token is expired
   * @param token - The verification token to check
   * @returns True if token is expired
   */
  isTokenExpired(token: VerificationToken): boolean;
}