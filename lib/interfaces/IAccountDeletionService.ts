/**
 * FILE: lib/interfaces/IAccountDeletionService.ts
 * PURPOSE: Defines the contract for account deletion services, including Supabase integration and error handling
 * DEPENDENCIES: AccountDeletionTypes
 */

import { AccountDeletionRequest, AccountDeletionResult } from '../types/AccountDeletionTypes';

export interface IAccountDeletionService {
  /**
   * Permanently deletes the user's account from Supabase authentication
   * @param request - Account deletion request containing user ID and optional metadata
   * @returns Promise resolving to deletion result with success status and optional error
   */
  deleteAccount(request: AccountDeletionRequest): Promise<AccountDeletionResult>;

  /**
   * Validates if the user is authenticated and eligible for account deletion
   * @returns Promise resolving to boolean indicating deletion eligibility
   */
  canDeleteAccount(): Promise<boolean>;

  /**
   * Checks if the deletion service is available (Supabase configured)
   * @returns Promise resolving to boolean indicating service availability
   */
  isServiceAvailable(): Promise<boolean>;
}