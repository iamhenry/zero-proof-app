/**
 * FILE: lib/services/EmailVerificationService.ts
 * PURPOSE: Stub implementation for email verification services using Supabase
 * FUNCTIONS: Minimal stub methods for email verification - NO BUSINESS LOGIC
 * DEPENDENCIES: IEmailVerificationService interface, DeepLinkTypes
 */

import { IEmailVerificationService } from '../interfaces/IEmailVerificationService';
import { VerificationResult, VerificationToken } from '../types/DeepLinkTypes';

/**
 * Stub implementation of email verification service
 * ALL METHODS ARE STUBS - NO BUSINESS LOGIC IMPLEMENTED
 */
export class EmailVerificationService implements IEmailVerificationService {
  constructor() {
    // Empty constructor - no initialization logic
  }

  /**
   * STUB: Verifies email token with Supabase
   * @param token - The verification token
   * @returns Promise that throws NotImplementedError
   */
  async verifyEmailToken(token: string): Promise<VerificationResult> {
    console.warn(`STUB: EmailVerificationService.verifyEmailToken(${token}) called - NOT IMPLEMENTED`);
    throw new Error('NotImplementedError: EmailVerificationService.verifyEmailToken');
  }

  /**
   * STUB: Updates verification status
   * @returns Promise resolving to false (stub behavior)
   */
  async updateVerificationStatus(): Promise<boolean> {
    console.warn('STUB: EmailVerificationService.updateVerificationStatus() called - NOT IMPLEMENTED');
    return false;
  }

  /**
   * STUB: Parses verification token
   * @param token - Raw token string
   * @returns Always returns null (stub behavior)
   */
  parseVerificationToken(token: string): VerificationToken | null {
    console.warn(`STUB: EmailVerificationService.parseVerificationToken(${token}) called - NOT IMPLEMENTED`);
    return null;
  }

  /**
   * STUB: Checks if token is expired
   * @param token - The verification token
   * @returns Always returns false (stub behavior)
   */
  isTokenExpired(token: VerificationToken): boolean {
    console.warn(`STUB: EmailVerificationService.isTokenExpired(${JSON.stringify(token)}) called - NOT IMPLEMENTED`);
    return false;
  }
}