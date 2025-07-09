/**
 * FILE: lib/types/AccountDeletionTypes.ts
 * PURPOSE: Type definitions for account deletion domain, including request/response models and error handling
 * DEPENDENCIES: None
 */

export interface AccountDeletionRequest {
  userId: string;
  reason?: string;
  timestamp?: number;
}

export interface AccountDeletionResult {
  success: boolean;
  message?: string;
  error?: AccountDeletionError;
}

export interface AccountDeletionError {
  code: string;
  message: string;
  details?: any;
}

export interface AccountDeletionState {
  isDeleting: boolean;
  isSuccess: boolean;
  error: AccountDeletionError | null;
  isModalVisible: boolean;
}

export interface AccountDeletionContextProps {
  state: AccountDeletionState;
  deleteAccount: () => Promise<void>;
  showModal: () => void;
  hideModal: () => void;
  clearError: () => void;
  reset: () => void;
}

export interface AccountDeletionModalProps {
  visible: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: AccountDeletionError | null;
}

export type AccountDeletionErrorCode = 
  | 'NETWORK_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'AUTHENTICATION_ERROR'
  | 'UNKNOWN_ERROR';