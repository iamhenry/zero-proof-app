import React from "react";
import { render, waitFor, act, fireEvent } from "@testing-library/react-native"; // Import fireEvent
import { Text, Button } from "react-native";
import {
	TimerStateProvider,
	useTimerState,
} from "../../../../context/TimerStateContext"; // Use relative path
import { RepositoryContext } from "../../../../context/RepositoryContext"; // Use relative path
import {
	TimerState,
	ISobrietyDataRepository,
} from "../../../../lib/types/repositories"; // Use relative path
import { defaultMockRepository } from "../../../../lib/test-utils"; // Use relative path

// --- Test Setup ---

// Helper component to consume and interact with the TimerStateContext
const TimerStateConsumer = () => {
	const { startTime, isRunning, isLoading, startTimer, stopTimer } =
		useTimerState();
	return (
		<>
			<Text testID="loading">{`Loading: ${isLoading}`}</Text>
			<Text testID="running">{`Running: ${isRunning}`}</Text>
			<Text testID="startTime">{`StartTime: ${startTime}`}</Text>
			<Button
				testID="startButton"
				title="Start"
				onPress={() => startTimer(Date.now())}
			/>
			<Button testID="stopButton" title="Stop" onPress={stopTimer} />
		</>
	);
};

// Wrapper providing only the RepositoryContext with the mock repository
const MockRepositoryWrapper: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => (
	<RepositoryContext.Provider
		value={defaultMockRepository as ISobrietyDataRepository}
	>
		{children}
	</RepositoryContext.Provider>
);

// --- Test Suite ---

describe("TimerStateProvider Persistence", () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
		// Explicitly cast to jest.Mock to satisfy TypeScript when calling mock methods
		(defaultMockRepository.loadTimerState as jest.Mock).mockResolvedValue(null);
		(defaultMockRepository.saveTimerState as jest.Mock).mockResolvedValue(
			undefined,
		);
	});

	// --- Test Cases ---

	// MARK: - Scenario: Loading saved state

	test("testInitialLoad_ShouldCallLoadTimerState", async () => {
		// Arrange
		(defaultMockRepository.loadTimerState as jest.Mock).mockClear();

		// Act: Render the provider and consumer
		render(
			<TimerStateProvider>
				<TimerStateConsumer />
			</TimerStateProvider>,
			{ wrapper: MockRepositoryWrapper },
		);

		// Assert: Check if loadTimerState was called
		await waitFor(() => {
			expect(defaultMockRepository.loadTimerState).toHaveBeenCalledTimes(1);
		});
	});

	test("testInitialLoad_WhenDataExists_ShouldApplyLoadedState", async () => {
		// Arrange
		const initialTimestamp = Date.now() - 3600000; // 1 hour ago
		const initialTimerState: TimerState = {
			startTime: initialTimestamp,
			isRunning: true,
		};
		(defaultMockRepository.loadTimerState as jest.Mock).mockResolvedValue(
			initialTimerState,
		);

		// Act
		const { findByText } = render(
			<TimerStateProvider>
				<TimerStateConsumer />
			</TimerStateProvider>,
			{ wrapper: MockRepositoryWrapper },
		);

		// Assert: Check rendered output reflects loaded state
		expect(await findByText("Loading: false")).toBeTruthy();
		expect(await findByText("Running: true")).toBeTruthy();
		expect(await findByText(`StartTime: ${initialTimestamp}`)).toBeTruthy();
		expect(defaultMockRepository.loadTimerState).toHaveBeenCalledTimes(1);
	});

	test("testInitialLoad_WhenNoDataExists_ShouldUseDefaults", async () => {
		// Arrange: (Handled by beforeEach)

		// Act
		const { findByText } = render(
			<TimerStateProvider>
				<TimerStateConsumer />
			</TimerStateProvider>,
			{ wrapper: MockRepositoryWrapper },
		);

		// Assert: Check rendered output reflects default state
		expect(await findByText("Loading: false")).toBeTruthy();
		expect(await findByText("Running: false")).toBeTruthy();
		expect(await findByText("StartTime: null")).toBeTruthy();
		expect(defaultMockRepository.loadTimerState).toHaveBeenCalledTimes(1);
	});

	// MARK: - Scenario: Saving state changes

	test("testStartTimer_ShouldCallSaveTimerState", async () => {
		// Arrange
		const { findByTestId, findByText } = render(
			<TimerStateProvider>
				<TimerStateConsumer />
			</TimerStateProvider>,
			{ wrapper: MockRepositoryWrapper },
		);
		expect(await findByText("Loading: false")).toBeTruthy(); // Wait for load
		(defaultMockRepository.saveTimerState as jest.Mock).mockClear();

		// Act: Simulate button press
		const startButton = await findByTestId("startButton");
		// Use fireEvent.press for simulating user interaction
		act(() => {
			fireEvent.press(startButton);
		});

		// Assert: Check save call and rendered state
		await waitFor(() => {
			expect(defaultMockRepository.saveTimerState).toHaveBeenCalledTimes(1);
		});
		expect(defaultMockRepository.saveTimerState).toHaveBeenCalledWith({
			startTime: expect.any(Number),
			isRunning: true,
		});
		expect(await findByText("Running: true")).toBeTruthy();
		expect(await findByText(/StartTime: \d+/)).toBeTruthy();
	});

	test("testStopTimer_ShouldCallSaveTimerState", async () => {
		// Arrange: Load initial running state
		const initialTimestamp = Date.now() - 3600000;
		const initialTimerState: TimerState = {
			startTime: initialTimestamp,
			isRunning: true,
		};
		(defaultMockRepository.loadTimerState as jest.Mock).mockResolvedValue(
			initialTimerState,
		);

		const { findByTestId, findByText } = render(
			<TimerStateProvider>
				<TimerStateConsumer />
			</TimerStateProvider>,
			{ wrapper: MockRepositoryWrapper },
		);
		expect(await findByText("Running: true")).toBeTruthy(); // Wait for load
		(defaultMockRepository.saveTimerState as jest.Mock).mockClear();

		// Act: Simulate button press
		const stopButton = await findByTestId("stopButton");
		// Use fireEvent.press for simulating user interaction
		act(() => {
			fireEvent.press(stopButton);
		});

		// Assert: Check save call and rendered state
		await waitFor(() => {
			expect(defaultMockRepository.saveTimerState).toHaveBeenCalledTimes(1);
		});
		expect(defaultMockRepository.saveTimerState).toHaveBeenCalledWith({
			startTime: null,
			isRunning: false,
		});
		expect(await findByText("Running: false")).toBeTruthy();
		expect(await findByText("StartTime: null")).toBeTruthy();
	});
});
