// __mocks__/@supabase/supabase-js/index.ts
// Tiny stub for Supabase client so imports resolve in Jest without hitting network.

const mockAuthApi = {
  getSession: jest.fn().mockResolvedValue({
    data: { session: { user: { id: "mock-user-id", email: "mock@example.com" } } },
  }),
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(),
  startAutoRefresh: jest.fn(),
  stopAutoRefresh: jest.fn(),
};

export const createClient = jest.fn(() => ({
  auth: mockAuthApi,
}));

export type User = any;
export type Session = any;
