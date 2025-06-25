/*
FILE: context/supabase-provider.tsx
PURPOSE: Supabase authentication context provider for managing user sessions and auth state throughout the Zero Proof app
FUNCTIONS:
  - SupabaseProvider({ children }) → JSX.Element: Context provider component that manages auth state and navigation
  - useSupabase() → SupabaseContextProps: Hook to access authentication context
  - signUp(email, password) → Promise<void>: Creates new user account with email verification
  - signInWithPassword(email, password) → Promise<void>: Authenticates user with email and password
  - signOut() → Promise<void>: Signs out current user and clears session
DEPENDENCIES: @supabase/supabase-js, expo-router, react, custom supabase config
*/

import { Session, User } from "@supabase/supabase-js";
import { useRouter, useSegments, SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

import { supabase, isSupabaseAvailable } from "@/config/supabase";

SplashScreen.preventAutoHideAsync();

type SupabaseContextProps = {
	user: User | null;
	session: Session | null;
	initialized?: boolean;
	signUp: (email: string, password: string) => Promise<void>;
	signInWithPassword: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

type SupabaseProviderProps = {
	children: React.ReactNode;
};

export const SupabaseContext = createContext<SupabaseContextProps>({
	user: null,
	session: null,
	initialized: false,
	signUp: async () => {},
	signInWithPassword: async () => {},
	signOut: async () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
	const router = useRouter();
	const segments = useSegments();
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [initialized, setInitialized] = useState<boolean>(false);

	const signUp = async (email: string, password: string) => {
		if (!supabase) {
			throw new Error('Supabase is not available - check environment configuration');
		}
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: 'zero-proof://welcome'
			}
		});
		if (error) {
			throw error;
		}
	};

	const signInWithPassword = async (email: string, password: string) => {
		if (!supabase) {
			throw new Error('Supabase is not available - check environment configuration');
		}
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		if (error) {
			throw error;
		}
	};

	const signOut = async () => {
		if (!supabase) {
			throw new Error('Supabase is not available - check environment configuration');
		}
		const { error } = await supabase.auth.signOut();
		if (error) {
			throw error;
		}
	};

	useEffect(() => {
		if (!supabase) {
			console.warn('⚠️ Supabase not available - authentication disabled');
			setInitialized(true);
			return;
		}

		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setUser(session ? session.user : null);
			setInitialized(true);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session ? session.user : null);
		});
	}, []);

	useEffect(() => {
		if (!initialized) return;

		const inProtectedGroup =
			segments && segments.length > 1 && segments[1] === "(protected)";

		if (session && !inProtectedGroup) {
			router.replace("/(app)/(protected)");
		} else if (!session) {
			router.replace("/(app)/welcome");
		}

		/* HACK: Something must be rendered when determining the initial auth state... 
		instead of creating a loading screen, we use the SplashScreen and hide it after
		a small delay (500 ms)
		*/

		setTimeout(() => {
			SplashScreen.hideAsync();
		}, 500);
	}, [initialized, session]);

	return (
		<SupabaseContext.Provider
			value={{
				user,
				session,
				initialized,
				signUp,
				signInWithPassword,
				signOut,
			}}
		>
			{children}
		</SupabaseContext.Provider>
	);
};
