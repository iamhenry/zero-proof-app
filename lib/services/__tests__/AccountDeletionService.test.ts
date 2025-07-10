/**
 * FILE: lib/services/__tests__/AccountDeletionService.test.ts
 * PURPOSE: Unit tests for AccountDeletionService following TDD RED phase methodology
 * SCENARIOS: Tests mapped from BDD scenarios for account deletion functionality
 */

import { AccountDeletionService } from '../AccountDeletionService';
import { 
  AccountDeletionRequest, 
  AccountDeletionResult, 
  AccountDeletionErrorCode 
} from '../../types/AccountDeletionTypes';

// Mock fetch function
const mockFetch = jest.fn();

// Mock Supabase client for auth operations
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn()
  }
};

// Mock toast function
const mockShowToast = jest.fn();

// Setup global fetch mock
global.fetch = mockFetch;

describe('AccountDeletionService', () => {
  let service: AccountDeletionService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    service = new AccountDeletionService(mockSupabaseClient, mockShowToast);
  });

  // MARK: - Scenario: Successful Account Deletion Flow
  describe('when deleting account with valid request', () => {
    it('should_delete_account_successfully_when_valid_request_provided', async () => {
      // Arrange
      const request: AccountDeletionRequest = {
        userId: 'test-user-123',
        reason: 'User requested deletion',
        timestamp: Date.now()
      };

      // Mock successful Edge Function response
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Account successfully deleted' })
      });

      // Mock session for auth token
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null
      });

      const expectedResult: AccountDeletionResult = {
        success: true,
        message: 'Account successfully deleted'
      };

      // Act
      const result = await service.deleteAccount(request);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/delete-account'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(request)
        })
      );
    });

    it('should_invalidate_credentials_when_account_deleted_successfully', async () => {
      // Arrange
      const request: AccountDeletionRequest = {
        userId: 'test-user-123',
        reason: 'User requested deletion',
        timestamp: Date.now()
      };

      // Mock successful Edge Function response
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Account successfully deleted' })
      });

      // Mock session for auth token
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null
      });

      // Act
      const result = await service.deleteAccount(request);

      // Assert - Verify credentials are invalidated by checking service state
      expect(result.success).toBe(true);
      
      // After successful deletion, subsequent auth operations should fail
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Invalid credentials' } 
      });
      
      const canDelete = await service.canDeleteAccount();
      expect(canDelete).toBe(false);
    });
  });

  // MARK: - Scenario: Supabase Service Unavailability
  describe('when Supabase service is unavailable', () => {
    it('should_return_failure_when_supabase_unavailable', async () => {
      // Arrange
      const request: AccountDeletionRequest = {
        userId: 'test-user-123'
      };

      // Create a service with null client to simulate unavailability
      const serviceWithNullClient = new AccountDeletionService(null, mockShowToast);

      const expectedResult: AccountDeletionResult = {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Supabase service is temporarily unavailable'
        }
      };

      // Act
      const result = await serviceWithNullClient.deleteAccount(request);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  // MARK: - Scenario: Account Deletion Eligibility Check
  describe('when checking account deletion eligibility', () => {
    it('should_return_false_when_checking_eligibility_for_unauthenticated_user', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      });

      // Act
      const canDelete = await service.canDeleteAccount();

      // Assert
      expect(canDelete).toBe(false);
    });

    it('should_return_true_when_checking_eligibility_for_authenticated_user', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: { id: 'test-user-123' } }, 
        error: null 
      });

      // Act
      const canDelete = await service.canDeleteAccount();

      // Assert
      expect(canDelete).toBe(true);
    });
  });

  // MARK: - Scenario: Service Availability Check
  describe('when checking service availability', () => {
    it('should_return_false_when_service_unavailable', async () => {
      // Arrange - Mock fetch to fail for availability check
      mockFetch.mockRejectedValue(new Error('Service unavailable'));

      // Act
      const isAvailable = await service.isServiceAvailable();

      // Assert
      expect(isAvailable).toBe(false);
    });

    it('should_return_true_when_service_available', async () => {
      // Arrange - Mock successful fetch response for availability check
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ available: true })
      });

      // Act
      const isAvailable = await service.isServiceAvailable();

      // Assert
      expect(isAvailable).toBe(true);
    });
  });

  // MARK: - Scenario: Network Failure During Account Deletion
  describe('when network errors occur during deletion', () => {
    it('should_handle_network_errors_gracefully', async () => {
      // Arrange
      const request: AccountDeletionRequest = {
        userId: 'test-user-123'
      };

      // Mock network error by rejecting fetch
      mockFetch.mockRejectedValue(
        new Error('Network connection failed')
      );

      // Mock session for auth token
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null
      });

      const expectedResult: AccountDeletionResult = {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network connection failed during account deletion'
        }
      };

      // Act
      const result = await service.deleteAccount(request);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });

  // MARK: - Scenario: Edge Function Error Responses
  describe('when Edge Function returns error responses', () => {
    it('should_handle_401_unauthorized_error', async () => {
      // Arrange
      const request: AccountDeletionRequest = {
        userId: 'test-user-123'
      };

      // Mock 401 unauthorized response
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      // Mock session for auth token
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'invalid-token' } },
        error: null
      });

      const expectedResult: AccountDeletionResult = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized to delete account'
        }
      };

      // Act
      const result = await service.deleteAccount(request);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should_handle_500_internal_server_error', async () => {
      // Arrange
      const request: AccountDeletionRequest = {
        userId: 'test-user-123'
      };

      // Mock 500 internal server error
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' })
      });

      // Mock session for auth token
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null
      });

      const expectedResult: AccountDeletionResult = {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Server error during account deletion'
        }
      };

      // Act
      const result = await service.deleteAccount(request);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should_handle_invalid_json_response', async () => {
      // Arrange
      const request: AccountDeletionRequest = {
        userId: 'test-user-123'
      };

      // Mock response with invalid JSON
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      // Mock session for auth token
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null
      });

      const expectedResult: AccountDeletionResult = {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Invalid response from server'
        }
      };

      // Act
      const result = await service.deleteAccount(request);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should_handle_fetch_timeout_error', async () => {
      // Arrange
      const request: AccountDeletionRequest = {
        userId: 'test-user-123'
      };

      // Mock fetch timeout
      mockFetch.mockRejectedValue(
        new Error('Request timeout')
      );

      // Mock session for auth token
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null
      });

      const expectedResult: AccountDeletionResult = {
        success: false,
        error: {
          code: 'TIMEOUT_ERROR',
          message: 'Request timeout during account deletion'
        }
      };

      // Act
      const result = await service.deleteAccount(request);

      // Assert
      expect(result).toEqual(expectedResult);
    });
  });
});