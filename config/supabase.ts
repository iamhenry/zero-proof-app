// [SUPABASE_AUTH_DISABLED] - Authentication disabled for simplified onboarding.
// Uncomment this file's original code to re-enable Supabase auth.
// Original imports and client initialization preserved below.

/*
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_API_URL as string;
const supabaseKey = process.env.EXPO_PUBLIC_API_KEY as string;

// Check if Supabase configuration is available
if (!supabaseUrl || !supabaseKey) {
	console.warn('Supabase configuration missing. Backend features will be disabled.');
	console.warn('Missing:', {
		url: !supabaseUrl ? 'EXPO_PUBLIC_API_URL' : 'ok',
		key: !supabaseKey ? 'EXPO_PUBLIC_API_KEY' : 'ok'
	});
}

// Create Supabase client with fallback for missing config
export const supabase = (supabaseUrl && supabaseKey) 
	? createClient(supabaseUrl, supabaseKey, {
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
	})
	: null;

// Export availability status
export const isSupabaseAvailable = !!(supabaseUrl && supabaseKey);

// Only set up AppState listener if Supabase is available
if (supabase) {
	AppState.addEventListener("change", (state) => {
		if (state === "active") {
			supabase.auth.startAutoRefresh();
		} else {
			supabase.auth.stopAutoRefresh();
		}
	});
}
*/

// [SUPABASE_AUTH_DISABLED] Stub exports -- Supabase client is disabled
export const supabase = null;
export const isSupabaseAvailable = false;
