/**
 * FILE: components/ui/settings/__tests__/AccountDeletionModal.test.tsx
 * PURPOSE: Unit tests for AccountDeletionModal following TDD RED phase methodology
 * SCENARIOS: Tests mapped from BDD scenarios for account deletion modal functionality
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccountDeletionModal } from '../AccountDeletionModal';
import { AccountDeletionModalProps } from '../../../../lib/types/AccountDeletionTypes';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({
  Feather: ({ name, size, color, ...props }: any) => {
    const MockFeather = require('react-native').Text;
    return <MockFeather testID={`feather-${name}`} {...props}>{name}</MockFeather>;
  }
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, ...props }: any) => {
    const MockText = require('react-native').Text;
    return <MockText {...props}>{children}</MockText>;
  }
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onPress, disabled, testID, ...props }: any) => {
    const MockButton = require('react-native').TouchableOpacity;
    return (
      <MockButton 
        onPress={onPress} 
        disabled={disabled}
        testID={testID || "button"}
        {...props}
      >
        {children}
      </MockButton>
    );
  }
}));

describe('AccountDeletionModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps: AccountDeletionModalProps = {
    visible: true,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    isLoading: false,
    error: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // MARK: - Scenario: Modal Visibility
  describe('when modal visibility is controlled', () => {
    it('should_render_modal_when_visible_true', () => {
      // Arrange
      const props = { ...defaultProps, visible: true };

      // Act
      const { getAllByText, getByText } = render(<AccountDeletionModal {...props} />);

      // Assert
      expect(getAllByText('Delete Account').length).toBeGreaterThan(0);
      expect(getByText(/Warning.*cannot be undone/i)).toBeTruthy();
    });

    it('should_not_render_modal_when_visible_false', () => {
      // Arrange
      const props = { ...defaultProps, visible: false };

      // Act
      const { queryByText } = render(<AccountDeletionModal {...props} />);

      // Assert - Modal should be hidden when visible=false
      expect(queryByText('Delete Account')).toBeFalsy();
    });
  });

  // MARK: - Scenario: Subscription Warning in Confirmation Modal
  describe('when subscription warning is displayed', () => {
    it('should_require_subscription_warning_acknowledgment', () => {
      // Arrange
      const { getByText, getByTestId } = render(<AccountDeletionModal {...defaultProps} />);

      // Act
      const deleteButton = getByTestId('delete-button');

      // Assert
      expect(getByText(/subscription.*management/i)).toBeTruthy();
      expect(getByText(/understand.*subscription.*separate/i)).toBeTruthy();
      expect(deleteButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should_enable_delete_button_when_warning_acknowledged', () => {
      // Arrange
      const { getByText, getByTestId } = render(<AccountDeletionModal {...defaultProps} />);

      // Act
      const acknowledgeButton = getByText(/understand.*subscription.*separate/i);
      fireEvent.press(acknowledgeButton);

      const deleteButton = getByTestId('delete-button');

      // Assert - button should be enabled after acknowledgment
      expect(deleteButton.props.accessibilityState.disabled).toBe(false);
    });
  });

  // MARK: - Scenario: Successful Account Deletion Flow
  describe('when user confirms deletion', () => {
    it('should_call_onConfirm_when_delete_button_pressed', async () => {
      // Arrange
      const { getByText, getByTestId } = render(<AccountDeletionModal {...defaultProps} />);

      // First acknowledge the warning
      const acknowledgeButton = getByText(/understand.*subscription.*separate/i);
      fireEvent.press(acknowledgeButton);

      // Act
      const deleteButton = getByTestId('delete-button');
      fireEvent.press(deleteButton);

      // Assert
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });
    });
  });

  // MARK: - Scenario: Account Deletion Cancellation
  describe('when user cancels deletion', () => {
    it('should_call_onCancel_when_cancel_button_pressed', () => {
      // Arrange
      const { getByTestId } = render(<AccountDeletionModal {...defaultProps} />);

      // Act
      const cancelButton = getByTestId('cancel-button');
      fireEvent.press(cancelButton);

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should_call_onCancel_when_x_button_pressed', () => {
      // Arrange
      const { getByTestId } = render(<AccountDeletionModal {...defaultProps} />);

      // Act
      const xButton = getByTestId('feather-x');
      fireEvent.press(xButton);

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  // MARK: - Scenario: Error Display
  describe('when error occurs during deletion', () => {
    it('should_display_error_message_when_error_provided', () => {
      // Arrange
      const error = {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed'
      };
      const props = { ...defaultProps, error };

      // Act
      const { getByText } = render(<AccountDeletionModal {...props} />);

      // Assert - Error section should be displayed when error is provided
      expect(getByText('❌ Error')).toBeTruthy();
      expect(getByText('Network connection failed')).toBeTruthy();
    });

    it('should_not_display_error_section_when_no_error', () => {
      // Arrange
      const props = { ...defaultProps, error: null };

      // Act
      const { queryByText } = render(<AccountDeletionModal {...props} />);

      // Assert - Error section should not be displayed when no error
      expect(queryByText('❌ Error')).toBeFalsy();
    });
  });

  // MARK: - Scenario: Loading State
  describe('when deletion is in progress', () => {
    it('should_show_loading_state_when_isLoading_true', () => {
      // Arrange
      const props = { ...defaultProps, isLoading: true };

      // Act
      const { getByTestId } = render(<AccountDeletionModal {...props} />);

      // Assert
      expect(getByTestId('activity-indicator')).toBeTruthy();
      
      const cancelButton = getByTestId('cancel-button');
      expect(cancelButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should_disable_buttons_when_loading', () => {
      // Arrange
      const props = { ...defaultProps, isLoading: true };

      // Act
      const { getByTestId } = render(<AccountDeletionModal {...props} />);

      // Assert
      const cancelButton = getByTestId('cancel-button');
      const deleteButton = getByTestId('delete-button');
      
      expect(cancelButton.props.accessibilityState.disabled).toBe(true);
      expect(deleteButton.props.accessibilityState.disabled).toBe(true);
    });
  });

  // MARK: - Scenario: Local Data Persistence After Account Deletion
  describe('when local data information is displayed', () => {
    it('should_display_local_data_warning', () => {
      // Arrange & Act
      const { getByText } = render(<AccountDeletionModal {...defaultProps} />);

      // Assert - Local data warning should be displayed
      expect(getByText(/^Local Data$/i)).toBeTruthy();
      expect(getByText(/local app data.*remain.*device.*uninstall/i)).toBeTruthy();
    });
  });
});