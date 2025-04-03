import "../global.css";

import { Slot } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
import { RepositoryProvider } from "@/context/RepositoryContext"; // Import the new provider
import { TimerStateProvider } from "@/context/TimerStateContext"; // Import TimerStateProvider

export default function AppLayout() {
	return (
		<RepositoryProvider>
			<TimerStateProvider>
				<SupabaseProvider>
					<Slot />
				</SupabaseProvider>
			</TimerStateProvider>
		</RepositoryProvider>
	);
}
