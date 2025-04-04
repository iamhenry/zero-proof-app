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
			setIsLoading(true);
			try {
				const loadedState = await repository.loadTimerState();
				if (isMounted) {
					setStartTime(loadedState?.startTime ?? null);
					setIsRunning(loadedState?.isRunning ?? false);
				}
			} catch (error) {
				console.error("Failed to load timer state in context:", error);
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
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
			const newState: TimerState = { startTime: time, isRunning: true };
			setStartTime(newState.startTime);
			setIsRunning(newState.isRunning);
			persistState(newState);
		},
		[persistState],
	);

	const stopTimer = useCallback(() => {
		const newState: TimerState = { startTime: null, isRunning: false };
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
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				setElapsedDays(days);
			} else {
				setElapsedDays(0);
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
