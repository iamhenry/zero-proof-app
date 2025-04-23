/**
 * FILE: context/TimerStateContext.tsx
 * PURPOSE: Manages global sobriety timer state (start time, running status, elapsed days) via React Context, handling persistence and testing scenarios.
 * FUNCTIONS:
 *   - TimerStateProvider({ children: ReactNode, forceNotSober?: boolean }): JSX.Element -> Provides timer state context with optional test override.
 *   - useTimerState(): TimerStateContextProps -> Hook to consume timer state and controls { startTime, isRunning, elapsedDays, startTimer, stopTimer, isLoading }.
 *   - startTimer(time: number): void -> Starts or restarts the timer with persistence and debug logging.
 *   - stopTimer(): void -> Stops the timer with persistence and debug logging.
 * KEY FEATURES:
 *   - Persistent timer state across app restarts with robust error handling
 *   - Automatic elapsed days calculation from timer start time
 *   - Regular interval updates for elapsed time display with memory leak prevention
 *   - Comprehensive debug logging for state changes and operations
 *   - Loading state management during initial data retrieval
 *   - Clean interval management to prevent memory leaks
 *   - Optimized performance with proper effect dependencies
 *   - Support for testing scenarios with forceNotSober prop
 * DEPENDENCIES: react, ./RepositoryContext, ../lib/types/repositories
 */
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	ReactNode,
} from "react";
import dayjs from "dayjs"; // Import dayjs
import { useRepository } from "./RepositoryContext";
import { TimerState, StoredDayData } from "../lib/types/repositories"; // Add StoredDayData

export interface TimerStateContextProps {
	// Export this interface
	startTime: number | null;
	isRunning: boolean;
	elapsedDays: number; // Added elapsedDays
	startTimer: (time: number) => void;
	stopTimer: () => void;
	isLoading: boolean;
}

export const TimerStateContext = createContext<
	TimerStateContextProps | undefined
>(undefined); // Export this context

interface TimerStateProviderProps {
	children: ReactNode;
	// For testing purposes - indicates if today is marked as not sober
	forceNotSober?: boolean;
}

export const TimerStateProvider: React.FC<TimerStateProviderProps> = ({
	children,
	forceNotSober = false,
}) => {
	const repository = useRepository();
	const [startTime, setStartTime] = useState<number | null>(null);
	const [isRunning, setIsRunning] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [elapsedDays, setElapsedDays] = useState<number>(0); // Added state for elapsed days

	// Load initial state
	useEffect(() => {
		let isMounted = true;
		const loadState = async () => {
			console.log("[TimerContext:load] Starting initial load...");
			setIsLoading(true);
			try {
				const loadedState = await repository.loadTimerState();
				console.log(
					`[TimerContext:load] Loaded state from repo: ${JSON.stringify(loadedState)}`,
				);

				if (isMounted) {
					// Determine initial state based on loaded data and forceNotSober
					let initialStartTime = loadedState?.startTime ?? null;
					let initialIsRunning = loadedState?.isRunning ?? false;

					// --- Verification Step ---
					// If persisted state says running, double-check today's actual status from repo
					// Only run verification if not already forced sober
					if (initialIsRunning && !forceNotSober) {
						try {
							const todayStr = dayjs().format("YYYY-MM-DD");
							const todayStatus: StoredDayData | null =
								await repository.loadDayStatus(todayStr);
							// Treat null/undefined status or explicitly false as not sober
							const isTodayActuallySober =
								typeof todayStatus === "boolean"
									? todayStatus
									: (todayStatus?.sober ?? false);

							if (!isTodayActuallySober) {
								console.log(
									`[TimerContext:load] Verification failed: Persisted running=true, but today (${todayStr}) is not sober in repo. Overriding state.`,
								);
								initialStartTime = null;
								initialIsRunning = false;
							} else {
								console.log(
									`[TimerContext:load] Verification passed: Persisted running=true and today (${todayStr}) is sober in repo.`,
								);
							}
						} catch (verifyError) {
							console.error(
								"[TimerContext:load] Error verifying today's status, defaulting to stop timer:",
								verifyError,
							);
							initialStartTime = null;
							initialIsRunning = false;
						}
					}
					// --- End Verification Step ---

					// Apply forceNotSober override *after* verification if necessary (it takes precedence)
					if (forceNotSober) {
						initialStartTime = null;
						initialIsRunning = false;
						console.log(
							`[TimerContext:load] forceNotSober=true. Final initial state: startTime=${initialStartTime}, isRunning=${initialIsRunning}`,
						);
					} else {
						// Log the state *after* potential verification override but *before* forceNotSober check
						console.log(
							`[TimerContext:load] State after verification (before forceNotSober check): startTime=${initialStartTime}, isRunning=${initialIsRunning}`,
						);
					}

					// Set the final determined initial state directly
					setStartTime(initialStartTime);
					setIsRunning(initialIsRunning);
				}
			} catch (error) {
				console.error("Failed to load timer state in context:", error);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
				console.log("[TimerContext:load] Finished initial load.");
			}
		};
		loadState();
		return () => {
			isMounted = false;
		};
		// Only depends on repository and forceNotSober prop
	}, [repository, forceNotSober]);

	const persistState = useCallback(
		async (newState: TimerState) => {
			try {
				await repository.saveTimerState(newState);
			} catch (error) {
				console.error("Failed to save timer state from context:", error);
			}
		},
		[repository],
	);

	const startTimer = useCallback(
		(time: number) => {
			console.log(`[TimerContext:startTimer] Received time: ${time}`);
			// Prevent starting timer when today is not sober (using forceNotSober prop)
			const newState: TimerState = forceNotSober
				? { startTime: null, isRunning: false }
				: { startTime: time, isRunning: true };
			setStartTime(newState.startTime);
			setIsRunning(newState.isRunning);
			persistState(newState);
			console.log(
				`[TimerContext:startTimer] Setting state & persisting: ${JSON.stringify(newState)}`,
			);
		},
		// Only depends on persistState and forceNotSober prop
		[persistState, forceNotSober],
	);

	const stopTimer = useCallback(() => {
		const newState: TimerState = { startTime: null, isRunning: false };
		console.log(
			`[TimerContext:stopTimer] Setting state & persisting: ${JSON.stringify(newState)}`,
		);
		setStartTime(newState.startTime);
		setIsRunning(newState.isRunning);
		persistState(newState);
	}, [persistState]);

	// Effect to calculate elapsed days
	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		const calculateDays = () => {
			if (isRunning && startTime) {
				const now = Date.now();
				const diff = now - startTime;
				console.log(
					`[TimerContext:calculateDays] Calculating: now=${now}, startTime=${startTime}`,
				);
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				setElapsedDays(days);
				console.log(
					`[TimerContext:calculateDays] Setting elapsedDays: ${days}`,
				);
			} else {
				setElapsedDays(0);
				console.log(
					"[TimerContext:calculateDays] Setting elapsedDays: 0 (timer not running or no start time)",
				);
			}
		};

		// Calculate immediately on change
		calculateDays();

		if (isRunning && startTime) {
			// Update every minute
			intervalId = setInterval(calculateDays, 60 * 1000);
		}

		// Cleanup interval on unmount or when timer stops/resets
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [isRunning, startTime]); // Re-run effect if isRunning or startTime changes

	return (
		<TimerStateContext.Provider
			value={{
				startTime,
				isRunning,
				elapsedDays, // Expose elapsedDays
				startTimer,
				stopTimer,
				isLoading,
			}}
		>
			{children}
		</TimerStateContext.Provider>
	);
};

export const useTimerState = (): TimerStateContextProps => {
	const context = useContext(TimerStateContext);
	if (context === undefined) {
		throw new Error("useTimerState must be used within a TimerStateProvider");
	}
	return context;
};
