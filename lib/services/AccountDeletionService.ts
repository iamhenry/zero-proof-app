/**
 * FILE: lib/services/AccountDeletionService.ts
 * PURPOSE: Account deletion service implementation for Supabase authentication with dependency injection
 * FUNCTIONS:
 *   - constructor(supabaseClient, showToast?) → AccountDeletionService: Initializes service with dependencies
 *   - deleteAccount(request) → Promise<AccountDeletionResult>: Permanently deletes user account from Supabase
 *   - canDeleteAccount() → Promise<boolean>: Validates user eligibility for account deletion
 *   - isServiceAvailable() → Promise<boolean>: Checks if Supabase service is available
 * DEPENDENCIES: IAccountDeletionService, AccountDeletionTypes, Supabase client
 */

import { IAccountDeletionService } from '../interfaces/IAccountDeletionService';
import { 
  AccountDeletionRequest, 
  AccountDeletionResult, 
  AccountDeletionError,
  AccountDeletionErrorCode 
} from '../types/AccountDeletionTypes';

export class AccountDeletionService implements IAccountDeletionService {
  private supabaseClient: any;
  private showToast?: (message: string, type: 'success' | 'error' | 'info') => void;

  constructor(
    supabaseClient: any,
    showToast?: (message: string, type: 'success' | 'error' | 'info') => void
  ) {
    this.supabaseClient = supabaseClient;
    this.showToast = showToast;
  }

  async deleteAccount(request: AccountDeletionRequest): Promise<AccountDeletionResult> {
    try {
      // Check if service is available
      const serviceAvailable = await this.isServiceAvailable();
      if (!serviceAvailable) {
        const error = this.createError(
          'SERVICE_UNAVAILABLE',
          'Supabase service is temporarily unavailable'
        );
        this.logError(error);
        this.showErrorToast(error.message);
        return { success: false, error };
      }

      // Attempt to delete the user account
      const { error: deleteError } = await this.supabaseClient.auth.admin.deleteUser(request.userId);
      
      if (deleteError) {
        // Check if it's a network error
        if (deleteError.message?.includes('network') || deleteError.message?.includes('connection')) {
          const error = this.createError(
            'NETWORK_ERROR',
            'Network connection failed during account deletion'
          );
          this.logError(error);
          this.showErrorToast(error.message);
          return { success: false, error };
        }
        
        // Generic error handling
        const error = this.createError(
          'UNKNOWN_ERROR',
          deleteError.message || 'Account deletion failed'
        );
        this.logError(error);
        this.showErrorToast(error.message);
        return { success: false, error };
      }

      // Success case
      const successMessage = 'Account successfully deleted';
      this.showSuccessToast(successMessage);
      return { success: true, message: successMessage };
      
    } catch (error) {
      // Handle network errors and unexpected errors
      const isNetworkError = error instanceof Error && (
        error.message?.includes('network') || 
        error.message?.includes('connection') ||
        error.message?.includes('fetch')
      );
      
      const errorCode: AccountDeletionErrorCode = isNetworkError ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR';
      const errorMessage = isNetworkError 
        ? 'Network connection failed during account deletion'
        : error instanceof Error ? error.message : 'Account deletion failed';
      
      const accountError = this.createError(errorCode, errorMessage);
      this.logError(accountError);
      this.showErrorToast(errorMessage);
      return { success: false, error: accountError };
    }
  }

  async canDeleteAccount(): Promise<boolean> {
    try {
      // Check if service is available first
      const serviceAvailable = await this.isServiceAvailable();
      if (!serviceAvailable) {
        return false;
      }

      // Check if user is authenticated
      const { data: { user }, error } = await this.supabaseClient.auth.getUser();
      
      if (error) {
        console.error('Error checking user authentication:', error);
        return false;
      }

      // Return true if user exists (authenticated)
      return user !== null;
      
    } catch (error) {
      console.error('Error in canDeleteAccount:', error);
      return false;
    }
  }

  async isServiceAvailable(): Promise<boolean> {
    try {
      // Check if Supabase client is properly configured
      if (!this.supabaseClient) {
        return false;
      }

      // Check if auth is available
      if (!this.supabaseClient.auth) {
        return false;
      }

      // Check if admin functions are available
      if (!this.supabaseClient.auth.admin) {
        return false;
      }

      return true;
      
    } catch (error) {
      console.error('Error checking service availability:', error);
      return false;
    }
  }

  private createError(code: AccountDeletionErrorCode, message: string, details?: any): AccountDeletionError {
    return {
      code,
      message,
      details
    };
  }

  private logError(error: AccountDeletionError): void {
    console.error('AccountDeletionService Error:', error);
  }

  private showSuccessToast(message: string): void {
    if (this.showToast) {
      this.showToast(message, 'success');
    }
  }

  private showErrorToast(message: string): void {
    if (this.showToast) {
      this.showToast(message, 'error');
    }
  }
}