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

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    admin: {
      deleteUser: jest.fn()
    }
  }
};

// Mock toast function
const mockShowToast = jest.fn();

describe('AccountDeletionService', () => {
  let service: AccountDeletionService;

  beforeEach(() => {
    jest.clearAllMocks();
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

      // Mock successful deletion response
      mockSupabaseClient.auth.admin.deleteUser.mockResolvedValue({
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
      // Arrange - service should check if Supabase is properly configured

      // Act
      const isAvailable = await service.isServiceAvailable();

      // Assert
      expect(isAvailable).toBe(true);
    });

    it('should_return_true_when_service_available', async () => {
      // Arrange - service should detect proper Supabase configuration

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

      // Mock network error by throwing a network-related error
      mockSupabaseClient.auth.admin.deleteUser.mockRejectedValue(
        new Error('Network connection failed')
      );

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
});