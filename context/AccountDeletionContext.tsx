/**
 * FILE: context/AccountDeletionContext.tsx
 * PURPOSE: React Context provider for account deletion state management with service integration
 * FUNCTIONS:
 *   - AccountDeletionProvider({ children }) → JSX.Element: Context provider managing account deletion state
 *   - useAccountDeletion() → AccountDeletionContextProps: Hook to consume account deletion context
 *   - deleteAccount() → Promise<void>: Initiates account deletion process with error handling
 *   - showModal() → void: Shows the account deletion confirmation modal
 *   - hideModal() → void: Hides the account deletion confirmation modal
 *   - clearError() → void: Clears any existing error state
 *   - reset() → void: Resets the entire account deletion state
 * DEPENDENCIES: react, AccountDeletionService, AccountDeletionTypes, Supabase context, Toast context
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AccountDeletionService } from '../lib/services/AccountDeletionService';
import { 
  AccountDeletionState, 
  AccountDeletionContextProps, 
  AccountDeletionError 
} from '../lib/types/AccountDeletionTypes';
import { useSupabase } from './supabase-provider';
import { useToast } from './toast-provider';
import { supabase } from '../config/supabase';

const AccountDeletionContext = createContext<AccountDeletionContextProps | undefined>(undefined);

export const useAccountDeletion = (): AccountDeletionContextProps => {
  const context = useContext(AccountDeletionContext);
  if (context === undefined) {
    throw new Error('useAccountDeletion must be used within an AccountDeletionProvider');
  }
  return context;
};

interface AccountDeletionProviderProps {
  children: ReactNode;
}

export const AccountDeletionProvider: React.FC<AccountDeletionProviderProps> = ({ children }) => {
  const { user, signOut } = useSupabase();
  const { showToast } = useToast();
  
  const [state, setState] = useState<AccountDeletionState>({
    isDeleting: false,
    isSuccess: false,
    error: null,
    isModalVisible: false
  });

  // Initialize service with dependencies
  const accountDeletionService = new AccountDeletionService(supabase, showToast);

  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!user) {
      const error: AccountDeletionError = {
        code: 'AUTHENTICATION_ERROR',
        message: 'User not authenticated'
      };
      setState(prev => ({ ...prev, error }));
      return;
    }

    // Set loading state and clear previous errors
    setState(prev => ({ 
      ...prev, 
      isDeleting: true, 
      error: null 
    }));

    try {
      // Call the account deletion service
      const result = await accountDeletionService.deleteAccount({
        userId: user.id,
        timestamp: Date.now()
      });

      if (result.success) {
        // Set success state
        setState(prev => ({ 
          ...prev, 
          isDeleting: false, 
          isSuccess: true,
          error: null 
        }));
        
        // Sign out the user after successful deletion
        await signOut();
      } else {
        // Handle deletion failure
        setState(prev => ({ 
          ...prev, 
          isDeleting: false, 
          error: result.error || {
            code: 'UNKNOWN_ERROR',
            message: 'Account deletion failed'
          }
        }));
      }
    } catch (error) {
      // Handle unexpected errors
      setState(prev => ({ 
        ...prev, 
        isDeleting: false, 
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred during account deletion'
        }
      }));
    }
  }, [user, accountDeletionService, signOut]);

  const showModal = useCallback((): void => {
    setState(prev => ({ ...prev, isModalVisible: true }));
  }, []);

  const hideModal = useCallback((): void => {
    setState(prev => ({ ...prev, isModalVisible: false }));
  }, []);

  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback((): void => {
    setState({
      isDeleting: false,
      isSuccess: false,
      error: null,
      isModalVisible: false
    });
  }, []);

  const value: AccountDeletionContextProps = {
    state,
    deleteAccount,
    showModal,
    hideModal,
    clearError,
    reset
  };

  return (
    <AccountDeletionContext.Provider value={value}>
      {children}
    </AccountDeletionContext.Provider>
  );
};