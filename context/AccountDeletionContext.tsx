/**
 * FILE: context/AccountDeletionContext.tsx
 * PURPOSE: React Context for managing account deletion state and operations
 * DEPENDENCIES: React, AccountDeletionService, AccountDeletionTypes
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AccountDeletionService } from '../lib/services/AccountDeletionService';
import { 
  AccountDeletionState, 
  AccountDeletionContextProps, 
  AccountDeletionRequest 
} from '../lib/types/AccountDeletionTypes';
import { useSupabase } from './supabase-provider';
import { useToast } from './toast-provider';
import { supabase } from '../config/supabase';

// Define action types for the reducer
type AccountDeletionAction = 
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_SUCCESS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: any }
  | { type: 'SET_MODAL_VISIBLE'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET' };

// Initial state
const initialState: AccountDeletionState = {
  isDeleting: false,
  isSuccess: false,
  error: null,
  isModalVisible: false
};

// Reducer function
function accountDeletionReducer(state: AccountDeletionState, action: AccountDeletionAction): AccountDeletionState {
  switch (action.type) {
    case 'SET_DELETING':
      return { ...state, isDeleting: action.payload };
    case 'SET_SUCCESS':
      return { ...state, isSuccess: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_MODAL_VISIBLE':
      return { ...state, isModalVisible: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Create the context
const AccountDeletionContext = createContext<AccountDeletionContextProps | undefined>(undefined);

// Provider component
interface AccountDeletionProviderProps {
  children: ReactNode;
}

export function AccountDeletionProvider({ children }: AccountDeletionProviderProps) {
  const [state, dispatch] = useReducer(accountDeletionReducer, initialState);

  const { user, signOut } = useSupabase();
  const { showToast } = useToast();

  const deleteAccount = async (): Promise<void> => {
    try {
      console.log('[AccountDeletionContext] Delete account initiated');
      
      // Check if user is authenticated
      if (!user) {
        console.log('[AccountDeletionContext] User not authenticated');
        const error = {
          code: 'AUTHENTICATION_ERROR',
          message: 'User not authenticated'
        };
        
        dispatch({ type: 'SET_ERROR', payload: error });
        showToast('User not authenticated', 'error');
        return;
      }

      console.log('[AccountDeletionContext] User authenticated, proceeding with deletion');

      // Set loading state
      dispatch({ type: 'SET_DELETING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Create service instance with supabase client
      const service = new AccountDeletionService(supabase, showToast);

      // Create deletion request
      const request: AccountDeletionRequest = {
        userId: user.id,
        timestamp: Date.now()
      };

      console.log('[AccountDeletionContext] Calling deletion service with request:', request);

      // Call service
      const result = await service.deleteAccount(request);
      
      console.log('[AccountDeletionContext] Service returned result:', result);

      if (result.success) {
        console.log('[AccountDeletionContext] Deletion successful, signing out user');
        dispatch({ type: 'SET_SUCCESS', payload: true });
        showToast(result.message || 'Account successfully deleted', 'success');
        
        // Sign out user after successful deletion
        await signOut();
      } else {
        console.log('[AccountDeletionContext] Deletion failed:', result.error);
        dispatch({ type: 'SET_ERROR', payload: result.error });
        showToast(result.error?.message || 'Account deletion failed', 'error');
      }
    } catch (error: any) {
      console.log('[AccountDeletionContext] Unexpected error during deletion:', error);
      const errorObj = {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred'
      };
      
      dispatch({ type: 'SET_ERROR', payload: errorObj });
      showToast(errorObj.message, 'error');
    } finally {
      dispatch({ type: 'SET_DELETING', payload: false });
    }
  };

  const showModal = () => {
    dispatch({ type: 'SET_MODAL_VISIBLE', payload: true });
  };

  const hideModal = () => {
    dispatch({ type: 'SET_MODAL_VISIBLE', payload: false });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const contextValue: AccountDeletionContextProps = {
    state,
    deleteAccount,
    showModal,
    hideModal,
    clearError,
    reset
  };

  return (
    <AccountDeletionContext.Provider value={contextValue}>
      {children}
    </AccountDeletionContext.Provider>
  );
}

// Hook to use the context
export function useAccountDeletion(): AccountDeletionContextProps {
  const context = useContext(AccountDeletionContext);
  
  if (context === undefined) {
    throw new Error('useAccountDeletion must be used within an AccountDeletionProvider');
  }
  
  return context;
}