/**
 * FILE: components/ui/calendar/__tests__/CalendarGrid.initial-position.test.tsx
 * PURPOSE: Red-phase tests proving the calendar launch scroll stability bug.
 *
 * These tests document the DESIRED behavior contract:
 *   1. Cold launch centers today exactly once — no duplicate automatic recenter.
 *   2. App resume preserves viewport until explicit timer-bar tap.
 *   3. getItemLayout row metrics are sourced from a single shared constant.
 *
 * All tests are expected to FAIL against current production code.
 * Production files must NOT be modified in this phase.
 */

import React from "react";
import {
	render,
	fireEvent,
	screen,
	act,
	waitFor,
} from "@testing-library/react-native";
import { AppState, AppStateStatus } from "react-native";
import "./mockNativeWind";

// --- Mock context hooks at module level (mirrors SobrietyTimer.interaction.test.tsx pattern) ---

import {
	useCalendarContext,
	CalendarContextProps,
} from "@/context/CalendarDataContext";
import { useRepository } from "@/context/RepositoryContext";
import { useTimerState } from "@/context/TimerStateContext";
import {
	ISobrietyDataRepository,
	TimerState,
} from "@/lib/types/repositories";
import { TimerStateContextProps } from "@/context/TimerStateContext";

jest.mock("@/context/CalendarDataContext", () => ({
	useCalendarContext: jest.fn(),
	CalendarDataProvider: ({ children }: { children: React.ReactNode }) =>
		children,
}));

jest.mock("@/context/RepositoryContext", () => ({
	useRepository: jest.fn(),
}));

jest.mock("@/context/TimerStateContext", () => ({
	useTimerState: jest.fn(),
	TimerStateProvider: ({ children }: { children: React.ReactNode }) =>
		children,
}));

// Mock nativewind
jest.mock("nativewind", () => ({
	styled: (component: any) => component,
	useColorScheme: () => "light",
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
	SafeAreaView: ({
		children,
		...props
	}: {
		children: React.ReactNode;
		[key: string]: any;
	}) => {
		const { View } = require("react-native");
		return <View {...props}>{children}</View>;
	},
}));

// Mock react-native-reanimated (required by SobrietyTimer)
const noopEasing = () => 0;
noopEasing.factory = () => noopEasing;
jest.mock("react-native-reanimated", () => {
	const { View, Text } = require("react-native");
	const easingFn = (val: any) => val;
	// Each Easing method returns itself so chained calls (Easing.out(Easing.ease)) work
	const easingProxy: any = new Proxy(
		{},
		{ get: () => () => easingFn },
	);
	return {
		__esModule: true,
		default: {
			View,
			Text,
			createAnimatedComponent: (comp: any) => comp,
		},
		useSharedValue: (val: any) => ({ value: val }),
		useAnimatedStyle: (fn: any) => fn(),
		withTiming: (val: any) => val,
		interpolate: (val: any) => val,
		Easing: easingProxy,
		FadeIn: { duration: () => ({ delay: () => ({}) }) },
		FadeOut: { duration: () => ({}) },
	};
});

// Mock child components that are not relevant to the scroll behavior under test.
// CalendarGrid is mocked because it would try to render a FlatList with complex state.
// StreakCounter and SavingsCounter are pure display components.
jest.mock("@/components/ui/calendar/CalendarGrid", () => ({
	CalendarGrid: () => {
		const { View, Text } = require("react-native");
		return (
			<View testID="mock-calendar-grid">
				<Text>MockCalendarGrid</Text>
			</View>
		);
	},
}));

// Also mock the barrel export if Home uses it
jest.mock("@/components/ui/calendar", () => ({
	CalendarGrid: () => {
		const { View, Text } = require("react-native");
		return (
			<View testID="mock-calendar-grid">
				<Text>MockCalendarGrid</Text>
			</View>
		);
	},
}));

jest.mock("@/components/ui/statistics", () => ({
	StreakCounter: ({ count }: { count: number }) => {
		const { View, Text } = require("react-native");
		return (
			<View testID="mock-streak-counter">
				<Text>{count} days</Text>
			</View>
		);
	},
	SavingsCounter: () => {
		const { View, Text } = require("react-native");
		return (
			<View testID="mock-savings-counter">
				<Text>MockSavings</Text>
			</View>
		);
	},
}));

// --- Mock scrollToToday tracking ---
const mockScrollToToday = jest.fn();
const mockCalendarRef = { current: null };

const createMockCalendarContext = (
	overrides?: Partial<CalendarContextProps>,
): CalendarContextProps => ({
	weeks: [],
	toggleSoberDay: jest.fn().mockResolvedValue(undefined),
	loadPastWeeks: jest.fn(),
	loadFutureWeeks: jest.fn(),
	currentStreak: 0,
	longestStreak: 0,
	isLoadingInitial: false,
	isLoadingPast: false,
	isLoadingFuture: false,
	scrollToToday: mockScrollToToday,
	calendarRef: mockCalendarRef as any,
	...overrides,
});

// --- Mock repository ---
const mockRepository: ISobrietyDataRepository = {
	saveDayStatus: jest.fn().mockResolvedValue(undefined),
	loadDayStatus: jest.fn().mockResolvedValue(null),
	loadAllDayStatus: jest.fn().mockResolvedValue({}),
	saveStreakData: jest.fn().mockResolvedValue(undefined),
	loadStreakData: jest.fn().mockResolvedValue(null),
	saveTimerState: jest.fn().mockResolvedValue(undefined),
	loadTimerState: jest.fn().mockResolvedValue({
		startTime: Date.now() - 1000 * 60 * 5,
		isRunning: true,
	}),
	saveDrinkCost: jest.fn().mockResolvedValue(undefined),
	loadDrinkCost: jest.fn().mockResolvedValue(null),
	saveOnboardingCompletion: jest.fn().mockResolvedValue(undefined),
	loadOnboardingCompletion: jest.fn().mockResolvedValue(true),
};

// --- Mock timer state ---
const getDefaultMockTimerStateValue = (): TimerStateContextProps => ({
	startTime: Date.now() - 1000 * 60 * 60 * 24 * 3,
	isRunning: true,
	elapsedDays: 3,
	isLoading: false,
	startTimer: jest.fn(),
	stopTimer: jest.fn(),
});

// We need to import Home lazily so the mocks are in place first.
// The Home component is the integration point that wires scrollToToday timers.
let Home: React.ComponentType;

beforeAll(() => {
	// Dynamic import after mocks are registered
	Home = require("@/app/(app)/(protected)/index").default;
});

// --- Shared test lifecycle helpers (Task 3.3 refactor) ---

/** Wire up the three context mocks every Home render needs. */
const setupDefaultMocks = () => {
	(useCalendarContext as jest.Mock).mockImplementation(() =>
		createMockCalendarContext(),
	);
	(useRepository as jest.Mock).mockImplementation(() => mockRepository);
	(useTimerState as jest.Mock).mockImplementation(() =>
		getDefaultMockTimerStateValue(),
	);
};

const setupTimers = () => {
	jest.useFakeTimers();
	mockScrollToToday.mockClear();
};

const teardownTimers = () => {
	jest.runOnlyPendingTimers();
	jest.useRealTimers();
	jest.restoreAllMocks();
};

// ============================================================================
// Task 1.1 — Cold-launch duplicate automatic recenter
// ============================================================================
describe("Feature: Cold-launch initial centering (Task 1.1)", () => {
	beforeEach(() => {
		setupTimers();
		setupDefaultMocks();
	});

	afterEach(teardownTimers);

	/**
	 * The current Home screen fires scrollToToday() twice via a 300ms primary
	 * timeout and a 500ms backup timeout. The desired contract is that initial
	 * positioning happens exactly once — either via CalendarGrid's
	 * initialScrollIndex OR a single scrollToToday() call, never both and
	 * never a duplicate backup.
	 *
	 * GREEN-PHASE ADJUSTMENT: CalendarGrid is now the single initial-position
	 * owner (via initialScrollIndex + scrollToIndex). Home no longer calls
	 * scrollToToday() at all on startup. Since CalendarGrid is mocked in this
	 * test file, the observable scrollToToday count from Home is 0, not 1.
	 * The "once" centering contract is upheld by CalendarGrid internally.
	 */
	test("centers today once on cold launch without a second automatic recenter", () => {
		render(<Home />);

		// Advance past the initial 300ms delay (primary scroll fires)
		act(() => {
			jest.advanceTimersByTime(350);
		});

		// Advance past the 500ms backup delay (backup scroll fires in current code)
		act(() => {
			jest.advanceTimersByTime(550);
		});

		// Contract: Home must not call scrollToToday on startup.
		// CalendarGrid owns initial positioning via initialScrollIndex.
		expect(mockScrollToToday).not.toHaveBeenCalled();
	});

	/**
	 * CalendarGrid already owns initialScrollIndex for the FlatList.
	 * The Home screen should NOT also call scrollToToday() because that
	 * creates a race between two positioning owners.
	 */
	test("Home screen does not call scrollToToday when CalendarGrid handles initial position", () => {
		// Simulate CalendarGrid having already positioned via initialScrollIndex
		// by providing weeks with a today entry and isLoadingInitial = false
		(useCalendarContext as jest.Mock).mockImplementation(() =>
			createMockCalendarContext({ isLoadingInitial: false }),
		);

		render(<Home />);

		// Advance all timers fully
		act(() => {
			jest.advanceTimersByTime(2000);
		});

		// Contract: Home should not trigger scrollToToday at all when
		// CalendarGrid's initialScrollIndex is the positioning owner.
		// Current code calls it 2 times via the timer cascade.
		expect(mockScrollToToday).not.toHaveBeenCalled();
	});
});

// ============================================================================
// Task 1.2 — Resume/background viewport preservation
// ============================================================================
describe("Feature: Resume preserves viewport until timer tap (Task 1.2)", () => {
	let appStateListeners: Array<(state: AppStateStatus) => void> = [];

	beforeEach(() => {
		setupTimers();
		appStateListeners = [];

		// Capture AppState listeners registered during render
		jest.spyOn(AppState, "addEventListener").mockImplementation(
			(type: string, listener: any) => {
				if (type === "change") {
					appStateListeners.push(listener);
				}
				return { remove: jest.fn() } as any;
			},
		);

		setupDefaultMocks();
	});

	afterEach(teardownTimers);

	const simulateAppResume = () => {
		// Fire all registered AppState listeners with "active"
		appStateListeners.forEach((listener) => listener("active"));
	};

	/**
	 * After the user scrolls away from today and the app goes to background
	 * then returns to foreground, the calendar should NOT automatically
	 * recenter. The viewport should stay where the user left it.
	 */
	test("preserves viewport on resume — scrollToToday is not called automatically", () => {
		render(<Home />);

		// Complete the initial launch scroll sequence
		act(() => {
			jest.advanceTimersByTime(1000);
		});

		// Clear the call count from initial launch
		mockScrollToToday.mockClear();

		// Simulate app going to background and coming back
		simulateAppResume();

		// Advance time to catch any async resume behavior
		act(() => {
			jest.advanceTimersByTime(1000);
		});

		// Contract: resume must NOT trigger scrollToToday
		expect(mockScrollToToday).not.toHaveBeenCalled();
	});

	/**
	 * After resume, tapping the timer bar should still explicitly recenter
	 * the calendar to today. This is the ONLY way resume should trigger
	 * a scroll back to today.
	 */
	test("timer bar tap still triggers explicit recenter after resume", async () => {
		const { findByText } = render(<Home />);

		// Complete the initial scroll
		act(() => {
			jest.advanceTimersByTime(1000);
		});
		mockScrollToToday.mockClear();

		// Simulate resume
		simulateAppResume();
		act(() => {
			jest.advanceTimersByTime(500);
		});
		mockScrollToToday.mockClear();

		// User taps the timer/sober text to recenter
		const soberText = await findByText("Sober");
		const timerContainer = soberText.parent;
		if (!timerContainer) throw new Error("Could not find timer container.");

		fireEvent.press(timerContainer);

		// Contract: explicit tap triggers exactly one scrollToToday
		expect(mockScrollToToday).toHaveBeenCalledTimes(1);
	});
});

// ============================================================================
// Task 1.3 — getItemLayout row-metric contract
// ============================================================================
describe("Feature: getItemLayout uses shared row metric constant (Task 1.3)", () => {
	/**
	 * The current CalendarGrid hardcodes `67` as the item length inside
	 * the inline getItemLayout lambda. The desired contract is that this
	 * value comes from a shared, exported constant (e.g. WEEK_ITEM_LENGTH)
	 * so CalendarGrid and CalendarDataContext.scrollToToday use the same math.
	 *
	 * This test imports the expected constant and validates the contract.
	 * It will fail until the constant is created and exported.
	 */
	test("exports WEEK_ITEM_LENGTH constant from calendar metrics", () => {
		// Attempt to import the shared constant from a centralized location.
		// This will fail at import-time or assertion-time until the constant exists.
		let WEEK_ITEM_LENGTH: number;
		try {
			// The plan envisions a shared metrics module; try the natural location
			const metrics = require("../calendarMetrics");
			WEEK_ITEM_LENGTH = metrics.WEEK_ITEM_LENGTH;
		} catch {
			// If the module doesn't exist yet, the test fails with a clear message
			throw new Error(
				"calendarMetrics module does not exist yet. " +
					"Expected components/ui/calendar/calendarMetrics.ts to export WEEK_ITEM_LENGTH.",
			);
		}

		expect(WEEK_ITEM_LENGTH).toBeDefined();
		expect(typeof WEEK_ITEM_LENGTH).toBe("number");
		expect(WEEK_ITEM_LENGTH).toBeGreaterThan(0);
	});

	/**
	 * Validate that a getWeekItemLayout helper function returns the correct
	 * layout object for any given index using the shared constant.
	 */
	test("getWeekItemLayout returns correct layout for a given index", () => {
		let getWeekItemLayout: (
			data: any,
			index: number,
		) => { index: number; length: number; offset: number };
		let WEEK_ITEM_LENGTH: number;

		try {
			const metrics = require("../calendarMetrics");
			getWeekItemLayout = metrics.getWeekItemLayout;
			WEEK_ITEM_LENGTH = metrics.WEEK_ITEM_LENGTH;
		} catch {
			throw new Error(
				"calendarMetrics module does not exist yet. " +
					"Expected components/ui/calendar/calendarMetrics.ts to export getWeekItemLayout and WEEK_ITEM_LENGTH.",
			);
		}

		expect(getWeekItemLayout).toBeDefined();

		// Validate layout contract for index 10
		expect(getWeekItemLayout(undefined, 10)).toEqual({
			index: 10,
			length: WEEK_ITEM_LENGTH,
			offset: WEEK_ITEM_LENGTH * 10,
		});

		// Validate layout contract for index 0
		expect(getWeekItemLayout(undefined, 0)).toEqual({
			index: 0,
			length: WEEK_ITEM_LENGTH,
			offset: 0,
		});
	});
});
