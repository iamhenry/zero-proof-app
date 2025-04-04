/**
 * FILE: app/_layout.tsx
 * PURPOSE: Configures the root layout for the application, wrapping routes with necessary context providers.
 * FUNCTIONS:
 *   - AppLayout(): JSX.Element -> Provides context (Repository, Timer, Calendar, Supabase) to the app.
 * DEPENDENCIES: expo-router, @/context/*
 */

import "../global.css";

import { Slot } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
import { RepositoryProvider } from "@/context/RepositoryContext";
import { TimerStateProvider } from "@/context/TimerStateContext";
import { CalendarDataProvider } from "@/context/CalendarDataContext"; // Ensure this import is present

export default function AppLayout() {
	return (
		<RepositoryProvider>
			<TimerStateProvider>
				{" "}
				{/* TimerStateProvider wraps CalendarDataProvider */}
				<CalendarDataProvider>
					{" "}
					{/* CalendarDataProvider is inside TimerStateProvider */}
					<SupabaseProvider>
						<Slot />
					</SupabaseProvider>
				</CalendarDataProvider>{" "}
				{/* Close CalendarDataProvider */}
			</TimerStateProvider>{" "}
			{/* Close TimerStateProvider */}
		</RepositoryProvider>
	);
}
