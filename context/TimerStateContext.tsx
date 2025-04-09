/**
 * FILE: context/TimerStateContext.tsx
 * PURPOSE: Manages global sobriety timer state (start time, running status, elapsed days) via React Context, handling persistence.
 * FUNCTIONS:
 *   - TimerStateProvider({ children: ReactNode }): JSX.Element -> Provides timer state context.
 *   - useTimerState(): TimerStateContextProps -> Hook to consume timer state and controls { startTime, isRunning, elapsedDays, startTimer, stopTimer, isLoading }.
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
import { useRepository } from "./RepositoryContext";
import { TimerState } from "../lib/types/repositories";

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
}

export const TimerStateProvider: React.FC<TimerStateProviderProps> = ({
	children,
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
					setStartTime(loadedState?.startTime ?? null);
					setIsRunning(loadedState?.isRunning ?? false);
				}
				console.log(
					`[TimerContext:load] Setting initial state: startTime=${loadedState?.startTime ?? null}, isRunning=${loadedState?.isRunning ?? false}`,
				);
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
	}, [repository]); // Only depends on repository instance

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
			const newState: TimerState = { startTime: time, isRunning: true };
			setStartTime(newState.startTime);
			setIsRunning(newState.isRunning);
			persistState(newState);
			console.log(
				`[TimerContext:startTimer] Setting state & persisting: ${JSON.stringify(newState)}`,
			);
		},
		[persistState],
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
