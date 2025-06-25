/**
 * FILE: app/_layout.tsx
 * PURPOSE: Configures the root layout for the application, wrapping routes with necessary context providers and initializing services.
 * FUNCTIONS:
 *   - AppLayout(): JSX.Element -> Provides context (Repository, Timer, Calendar, Savings, Supabase) to the app and initializes DeepLinkService.
 * DEPENDENCIES: expo-router, @/context/*, @/config/revenuecat, @/lib/services/DeepLinkService
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
import { ToastProvider, useToast } from "@/context/toast-provider";
import { configureRevenueCat } from "@/config/revenuecat";
import { DeepLinkService } from "@/lib/services/DeepLinkService";

// Component that initializes services with access to toast context
function ServiceInitializer() {
	const { showToast } = useToast();

	useEffect(() => {
		// Initialize DeepLinkService with toast function
		const deepLinkService = new DeepLinkService(showToast);
		
		const initializeDeepLinkService = async () => {
			try {
				// Initialize DeepLinkService
				console.log("Initializing DeepLinkService...");
				deepLinkService.registerDeepLinkListener();
				console.log("DeepLinkService initialized successfully");
			} catch (error) {
				console.error("Failed to initialize DeepLinkService:", error);
				// Don't throw error to prevent app crash
			}
		};

		// Start service initialization
		initializeDeepLinkService();

		// Cleanup function for service shutdown
		return () => {
			try {
				console.log("Cleaning up DeepLinkService...");
				deepLinkService.unregisterDeepLinkListener();
			} catch (error) {
				console.error("Error cleaning up DeepLinkService:", error);
			}
		};
	}, [showToast]);

	return null; // This component only handles initialization
}

export default function AppLayout() {
	useEffect(() => {
		// Initialize RevenueCat SDK on app startup
		const initializeRevenueCat = async () => {
			try {
				console.log("Initializing RevenueCat SDK...");
				const success = await configureRevenueCat();
				if (success) {
					console.log("RevenueCat SDK initialized successfully");
				} else {
					console.log("RevenueCat SDK initialization failed - subscription features disabled");
				}
			} catch (error) {
				console.error("Failed to initialize RevenueCat SDK:", error);
				// Don't throw error to prevent app crash - paywall will handle gracefully
			}
		};

		// Initialize DeepLinkService - will be moved inside ToastProvider
		// const deepLinkService = new DeepLinkService();
		
		const initializeServices = async () => {
			try {
				// Initialize RevenueCat first
				await initializeRevenueCat();
				
				// DeepLinkService initialization moved to ServiceInitializer component
				// which has access to toast context
			} catch (error) {
				console.error("Failed to initialize services:", error);
				// Don't throw error to prevent app crash
			}
		};

		initializeServices();
	}, []);

	return (
		<ToastProvider>
			<ServiceInitializer />
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
