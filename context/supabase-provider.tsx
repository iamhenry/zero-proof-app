/*
FILE: context/supabase-provider.tsx
PURPOSE: [SUPABASE_AUTH_DISABLED] Auth provider disabled. Acts as no-op passthrough.
  All auth functions return no-op. Navigation always routes to /(app)/(protected).
  Uncomment original code blocks to re-enable Supabase auth.
DEPENDENCIES: expo-router, react
*/

// [SUPABASE_AUTH_DISABLED] Original Supabase imports commented out
// import { Session, User } from "@supabase/supabase-js";
import { useRouter, useSegments, SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";

// [SUPABASE_AUTH_DISABLED] Original config import commented out
// import { supabase, isSupabaseAvailable } from "@/config/supabase";

SplashScreen.preventAutoHideAsync();

type SupabaseContextProps = {
	user: null;
	session: null;
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
	const [initialized, setInitialized] = useState<boolean>(false);

	/* [SUPABASE_AUTH_DISABLED] Original auth state commented out
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);

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
	*/

	// [SUPABASE_AUTH_DISABLED] No-op auth functions
	const signUp = async () => {};
	const signInWithPassword = async () => {};
	const signOut = async () => {};

	useEffect(() => {
		/* [SUPABASE_AUTH_DISABLED] Original session check commented out
		if (!supabase) {
			console.warn('Supabase not available - authentication disabled');
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
		*/

		// [SUPABASE_AUTH_DISABLED] Immediately mark as initialized
		setInitialized(true);
	}, []);

	useEffect(() => {
		if (!initialized) return;

		const inProtectedGroup =
			segments && segments.length > 1 && segments[1] === "(protected)";

		/* [SUPABASE_AUTH_DISABLED] Original auth-based routing commented out
		if (session && !inProtectedGroup) {
			router.replace("/(app)/(protected)");
		} else if (!session) {
			router.replace("/(app)/welcome");
		}
		*/

		// [SUPABASE_AUTH_DISABLED] Always route to protected group (skip welcome/auth)
		if (!inProtectedGroup) {
			router.replace("/(app)/(protected)");
		}

		setTimeout(() => {
			SplashScreen.hideAsync();
		}, 500);
	}, [initialized]);

	return (
		<SupabaseContext.Provider
			value={{
				user: null,
				session: null,
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
