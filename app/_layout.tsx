/**
 * FILE: app/_layout.tsx
 * PURPOSE: Configures the root layout for the application, wrapping routes with necessary context providers.
 * FUNCTIONS:
 *   - AppLayout(): JSX.Element -> Provides context (Repository, Timer, Calendar, Savings, Supabase) to the app.
 * DEPENDENCIES: expo-router, @/context/*, @/config/revenuecat
 */

import "../global.css";

import { useEffect } from "react";
import { Slot } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
import { RepositoryProvider } from "@/context/RepositoryContext";
import { TimerStateProvider } from "@/context/TimerStateContext";
import { CalendarDataProvider } from "@/context/CalendarDataContext";
import { SavingsDataProvider } from "@/context/SavingsDataContext"; // Import the new provider
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ToastProvider } from "@/context/toast-provider";
import { configureRevenueCat } from "@/config/revenuecat";

export default function AppLayout() {
	useEffect(() => {
		// Initialize RevenueCat SDK on app startup
		const initializeRevenueCat = async () => {
			try {
				console.log("Initializing RevenueCat SDK...");
				await configureRevenueCat();
				console.log("RevenueCat SDK initialized successfully");
			} catch (error) {
				console.error("Failed to initialize RevenueCat SDK:", error);
				// Don't throw error to prevent app crash - paywall will handle gracefully
			}
		};

		initializeRevenueCat();
	}, []);

	return (
		<ToastProvider>
			<RepositoryProvider>
				<TimerStateProvider>
					<CalendarDataProvider>
						<SavingsDataProvider>
							<SupabaseProvider>
								<SubscriptionProvider>
									<Slot />
								</SubscriptionProvider>
							</SupabaseProvider>
						</SavingsDataProvider>
					</CalendarDataProvider>
				</TimerStateProvider>
			</RepositoryProvider>
		</ToastProvider>
	);
}
