/**
 * FILE: context/__tests__/AccountDeletionContext.test.tsx
 * PURPOSE: Unit tests for AccountDeletionContext following TDD RED phase methodology
 * SCENARIOS: Tests mapped from BDD scenarios for account deletion state management
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { AccountDeletionProvider, useAccountDeletion } from '../AccountDeletionContext';
import { AccountDeletionContextProps } from '../../lib/types/AccountDeletionTypes';

// Mock dependencies
const mockSignOut = jest.fn();
const mockShowToast = jest.fn();
const mockDeleteUser = jest.fn();

const mockSupabaseProviderConfig = {
  user: { id: 'test-user-123', email: 'test@example.com' },
  signOut: mockSignOut
};

jest.mock('../supabase-provider', () => ({
  useSupabase: () => mockSupabaseProviderConfig
}));

jest.mock('../toast-provider', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

// Create a mock that can be accessed from the test
const mockSupabaseClient = {
  auth: {
    admin: {
      deleteUser: mockDeleteUser
    }
  }
};

jest.mock('../../config/supabase', () => ({
  supabase: mockSupabaseClient
}));

// Mock the AccountDeletionService
const mockDeleteAccount = jest.fn();
jest.mock('../../lib/services/AccountDeletionService', () => ({
  AccountDeletionService: jest.fn().mockImplementation(() => ({
    deleteAccount: mockDeleteAccount
  }))
}));

// Test wrapper component
const createWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccountDeletionProvider>
    {children}
  </AccountDeletionProvider>
);

describe('AccountDeletionContext', () => {
  let contextValue: AccountDeletionContextProps;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to authenticated user by default
    mockSupabaseProviderConfig.user = { id: 'test-user-123', email: 'test@example.com' };
    // Mock successful deletion by default
    mockDeleteUser.mockResolvedValue({ data: {}, error: null });
    // Mock service to return success by default
    mockDeleteAccount.mockResolvedValue({
      success: true,
      message: 'Account successfully deleted'
    });
  });

  // MARK: - Scenario: Modal Visibility Management
  describe('when managing modal visibility', () => {
    it('should_show_modal_when_showModal_called', () => {
      // Arrange
      const { result } = renderHook(() => useAccountDeletion(), {
        wrapper: createWrapper
      });

      // Act
      act(() => {
        result.current.showModal();
      });

      // Assert
      expect(result.current.state.isModalVisible).toBe(true);
    });

    it('should_hide_modal_when_hideModal_called', () => {
      // Arrange
      const { result } = renderHook(() => useAccountDeletion(), {
        wrapper: createWrapper
      });

      // First show the modal
      act(() => {
        result.current.showModal();
      });

      // Act
      act(() => {
        result.current.hideModal();
      });

      // Assert
      expect(result.current.state.isModalVisible).toBe(false);
    });
  });

  // MARK: - Scenario: Error State Management
  describe('when managing error state', () => {
    it('should_clear_error_when_clearError_called', () => {
      // Arrange
      const { result } = renderHook(() => useAccountDeletion(), {
        wrapper: createWrapper
      });

      // Act
      act(() => {
        result.current.clearError();
      });

      // Assert
      expect(result.current.state.error).toBeNull();
    });
  });

  // MARK: - Scenario: State Reset
  describe('when resetting state', () => {
    it('should_reset_state_when_reset_called', () => {
      // Arrange
      const { result } = renderHook(() => useAccountDeletion(), {
        wrapper: createWrapper
      });

      const expectedInitialState = {
        isDeleting: false,
        isSuccess: false,
        error: null,
        isModalVisible: false
      };

      // Act
      act(() => {
        result.current.reset();
      });

      // Assert
      expect(result.current.state).toEqual(expectedInitialState);
    });
  });

  // MARK: - Scenario: Authentication Error During Deletion
  describe('when user is not authenticated', () => {
    it('should_handle_authentication_error_during_deletion', async () => {
      // Arrange - Set user to null for unauthenticated state
      mockSupabaseProviderConfig.user = null;
      
      const { result } = renderHook(() => useAccountDeletion(), {
        wrapper: createWrapper
      });

      const expectedError = {
        code: 'AUTHENTICATION_ERROR',
        message: 'User not authenticated'
      };

      // Act
      await act(async () => {
        await result.current.deleteAccount();
      });

      // Assert
      expect(result.current.state.error).toEqual(expectedError);
    });
  });

  // MARK: - Scenario: Successful Account Deletion Flow
  describe('when deleting account successfully', () => {
    it('should_initiate_deletion_process_when_deleteAccount_called', async () => {
      // Arrange
      const { result } = renderHook(() => useAccountDeletion(), {
        wrapper: createWrapper
      });

      // Act
      await act(async () => {
        await result.current.deleteAccount();
      });

      // Assert
      expect(result.current.state.isSuccess).toBe(true);
      expect(result.current.state.isDeleting).toBe(false);
      expect(result.current.state.error).toBeNull();
    });

    it('should_set_loading_state_during_deletion_process', async () => {
      // Arrange
      const { result } = renderHook(() => useAccountDeletion(), {
        wrapper: createWrapper
      });

      // Make the service mock return a promise that we can control
      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      
      mockDeleteAccount.mockImplementation(() => {
        return deletePromise.then(() => ({
          success: true,
          message: 'Account successfully deleted'
        }));
      });

      // Act
      let deleteCall: Promise<void>;
      act(() => {
        deleteCall = result.current.deleteAccount();
      });

      // Assert - loading state should be true during deletion
      expect(result.current.state.isDeleting).toBe(true);

      // Resolve the promise and wait for completion
      await act(async () => {
        resolveDelete();
        await deleteCall;
      });

      // Final state should have loading false
      expect(result.current.state.isDeleting).toBe(false);
    });
  });

  // MARK: - Scenario: Context Hook Usage
  describe('when using context hook outside provider', () => {
    it('should_throw_error_when_hook_used_outside_provider', () => {
      // Arrange & Act & Assert
      const { result } = renderHook(() => useAccountDeletion());
      expect(result.error).toEqual(Error('useAccountDeletion must be used within an AccountDeletionProvider'));
    });
  });
});