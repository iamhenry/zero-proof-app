import React from "react";
import { SupabaseContext } from "@/context/supabase-provider";

/**
 * Helper that returns a wrapper component supplying SupabaseContext with a mocked user.
 * Usage:
 *   const Wrapper = withSupabaseProvider('henry@example.com');
 *   render(<Avatar />, { wrapper: Wrapper });
 */
export const withSupabaseProvider = (email: string | null = "test@example.com") => {
  const mockUser = email ? { id: "mock-user-id", email } as any : null;

  const mockContext = {
    user: mockUser,
    session: mockUser ? { user: mockUser } as any : null,
    initialized: true,
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  } as any;

  return ({ children }: { children: React.ReactNode }) => (
    <SupabaseContext.Provider value={mockContext}>{children}</SupabaseContext.Provider>
  );
};
