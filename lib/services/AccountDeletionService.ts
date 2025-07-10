/**
 * FILE: lib/services/AccountDeletionService.ts
 * PURPOSE: Service for handling account deletion via Supabase Edge Functions
 * DEPENDENCIES: AccountDeletionTypes, supabase client
 */

import { 
  AccountDeletionRequest, 
  AccountDeletionResult, 
  AccountDeletionErrorCode 
} from '../types/AccountDeletionTypes';

export class AccountDeletionService {
  private supabaseClient: any;
  private showToast: ((message: string, type?: 'success' | 'error' | 'info') => void) | null;

  constructor(supabaseClient: any, showToast?: (message: string, type?: 'success' | 'error' | 'info') => void) {
    this.supabaseClient = supabaseClient;
    this.showToast = showToast || null;
  }

  async deleteAccount(request: AccountDeletionRequest): Promise<AccountDeletionResult> {
    try {
      console.log('[AccountDeletionService] Starting account deletion process', request);
      
      // Check if service is available
      if (!this.supabaseClient) {
        console.log('[AccountDeletionService] Supabase client not available');
        return {
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Supabase service is temporarily unavailable'
          }
        };
      }

      // Get user session for authentication
      console.log('[AccountDeletionService] Getting user session...');
      const { data: sessionData, error: sessionError } = await this.supabaseClient.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.log('[AccountDeletionService] Authentication failed:', sessionError?.message || 'No session');
        return {
          success: false,
          error: {
            code: 'AUTHENTICATION_ERROR',
            message: 'User not authenticated'
          }
        };
      }

      console.log('[AccountDeletionService] Session obtained successfully');

      // Construct Edge Function URL
      const edgeFunctionUrl = `${this.supabaseClient.supabaseUrl || 'https://mock-supabase.com'}/functions/v1/delete-account`;
      console.log('[AccountDeletionService] Making request to:', edgeFunctionUrl);

      // Make HTTP request to Edge Function
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      console.log('[AccountDeletionService] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      // Handle different response status codes
      if (!response.ok) {
        console.log('[AccountDeletionService] Request failed with status:', response.status);
        return this.handleHttpError(response.status);
      }

      // Parse response
      let responseData;
      try {
        responseData = await response.json();
        console.log('[AccountDeletionService] Response data:', responseData);
      } catch (jsonError) {
        console.log('[AccountDeletionService] Failed to parse JSON response:', jsonError);
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'Invalid response from server'
          }
        };
      }

      // Return successful result
      console.log('[AccountDeletionService] Account deletion completed successfully');
      return {
        success: true,
        message: responseData.message || 'Account successfully deleted'
      };

    } catch (error: any) {
      console.log('[AccountDeletionService] Network error occurred:', error.message);
      return this.handleNetworkError(error);
    }
  }

  async canDeleteAccount(): Promise<boolean> {
    try {
      if (!this.supabaseClient) {
        return false;
      }

      const { data: userData, error } = await this.supabaseClient.auth.getUser();
      
      if (error || !userData.user) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async isServiceAvailable(): Promise<boolean> {
    try {
      if (!this.supabaseClient) {
        return false;
      }

      // Try to make a simple request to check if service is available
      const edgeFunctionUrl = `${this.supabaseClient.supabaseUrl || 'https://mock-supabase.com'}/functions/v1/delete-account`;
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'HEAD' // Use HEAD to check availability without processing
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  private handleHttpError(status: number): AccountDeletionResult {
    switch (status) {
      case 401:
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized to delete account'
          }
        };
      case 500:
        return {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Server error during account deletion'
          }
        };
      default:
        return {
          success: false,
          error: {
            code: 'UNKNOWN_ERROR',
            message: 'Unknown error occurred during account deletion'
          }
        };
    }
  }

  private handleNetworkError(error: any): AccountDeletionResult {
    const errorMessage = error.message || 'Unknown network error';
    
    // Check for timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      return {
        success: false,
        error: {
          code: 'TIMEOUT_ERROR',
          message: 'Request timeout during account deletion'
        }
      };
    }

    // Default to network error
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed during account deletion'
      }
    };
  }
}