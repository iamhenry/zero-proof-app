/**
 * FILE: lib/test-utils.tsx
 * PURPOSE: Provides utility components and functions for setting up React Testing Library tests, including context providers with mock values.
 * FUNCTIONS:
 *   - TestWrapper(props: TestWrapperProps) → JSX.Element: Wraps test components with mock Repository and TimerState contexts.
 *   - createTestWrapper(overrides?: {...}) → React.FC<{ children: ReactNode }>: Factory function to create a TestWrapper with specific context value overrides.
 * DEPENDENCIES: react, @/context/RepositoryContext, @/context/TimerStateContext, @/lib/types/repositories
 */
import React, { ReactNode } from "react";
// Import the actual Context objects and their value types/interfaces
import { RepositoryContext } from "@/context/RepositoryContext";
import {
	TimerStateContext,
	TimerStateContextProps,
} from "@/context/TimerStateContext"; // Assuming TimerStateContextProps is exported or reconstruct if needed
import { ISobrietyDataRepository } from "@/lib/types/repositories";

// Define the props for the wrapper, accepting the *exact* context value types
interface TestWrapperProps {
	children: ReactNode;
	repositoryValue?: ISobrietyDataRepository; // The exact type provided by RepositoryContext
	timerStateValue?: TimerStateContextProps; // The exact type provided by TimerStateContext
}

// Default mock implementations matching the context value types
export const defaultMockRepository: jest.Mocked<ISobrietyDataRepository> = {
	loadAllDayStatus: jest.fn().mockResolvedValue({}),
	loadDayStatus: jest.fn().mockResolvedValue(null),
	saveDayStatus: jest.fn().mockResolvedValue(undefined),
	loadStreakData: jest.fn().mockResolvedValue(null),
	saveStreakData: jest.fn().mockResolvedValue(undefined),
	loadTimerState: jest.fn().mockResolvedValue(null),
	saveTimerState: jest.fn().mockResolvedValue(undefined),
	loadDrinkCost: jest.fn().mockResolvedValue(null),
	saveDrinkCost: jest.fn().mockResolvedValue(undefined),
};

export const defaultMockTimerState: jest.Mocked<TimerStateContextProps> = {
	startTimer: jest.fn(),
	stopTimer: jest.fn(),
	isRunning: false,
	startTime: null,
	isLoading: false, // Default to false, tests can override if needed
};

// The Corrected Test Wrapper Component
export const TestWrapper: React.FC<TestWrapperProps> = ({
	children,
	repositoryValue = defaultMockRepository, // Use defaults if no value provided
	timerStateValue = defaultMockTimerState, // Use defaults if no value provided
}) => {
	// Directly use the Context.Provider components with the provided mock values
	return (
		<RepositoryContext.Provider value={repositoryValue}>
			<TimerStateContext.Provider value={timerStateValue}>
				{children}
			</TimerStateContext.Provider>
		</RepositoryContext.Provider>
	);
};

// Helper function to create the wrapper with specific overrides for renderHook/render
// This makes it cleaner in the test files
export const createTestWrapper = (overrides?: {
	repositoryValue?: Partial<ISobrietyDataRepository>;
	timerStateValue?: Partial<TimerStateContextProps>;
}): React.FC<{ children: ReactNode }> => {
	const mergedRepositoryValue = {
		...defaultMockRepository,
		...(overrides?.repositoryValue || {}),
	};
	const mergedTimerStateValue = {
		...defaultMockTimerState,
		...(overrides?.timerStateValue || {}),
	};

	// Return a component suitable for the 'wrapper' option
	return ({ children }) => (
		<TestWrapper
			repositoryValue={mergedRepositoryValue as ISobrietyDataRepository} // Cast needed after merge
			timerStateValue={mergedTimerStateValue as TimerStateContextProps} // Cast needed after merge
		>
			{children}
		</TestWrapper>
	);
};
