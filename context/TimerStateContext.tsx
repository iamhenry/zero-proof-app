/**
 * FILE: context/TimerStateContext.tsx
 * PURPOSE: Provides a React context for managing the global sobriety timer state (start time, running status, loading status). Handles loading/saving state via RepositoryContext.
 * FUNCTIONS:
 *   - TimerStateProvider(props: { children: ReactNode }) → JSX.Element: Context provider component.
 *   - useTimerState() → TimerStateContextProps: Hook to access timer state and control functions.
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

	return (
		<TimerStateContext.Provider
			value={{ startTime, isRunning, startTimer, stopTimer, isLoading }}
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
