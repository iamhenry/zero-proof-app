import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native'; // Import waitFor from react-native
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // Import UTC plugin
import isBetween from 'dayjs/plugin/isBetween';
import { useCalendarData } from '../useCalendarData';
import { DayData, WeekData } from '../../types';
import { createTestWrapper } from '@/lib/test-utils'; // Import the wrapper creator
import { LocalStorageSobrietyRepository } from '@/lib/storage/LocalStorageSobrietyRepository'; // Import the actual class/type
import { ISobrietyDataRepository } from '@/lib/types/repositories'; // Import repository interface
import { TimerStateContextProps } from '@/context/TimerStateContext'; // Import timer context props type

// Mock the repository
jest.mock('@/lib/storage/LocalStorageSobrietyRepository');
const MockLocalStorageSobrietyRepository = LocalStorageSobrietyRepository as jest.MockedClass<typeof LocalStorageSobrietyRepository>;

// Define mocks at the top level scope
let mockLoadAllDayStatus: jest.Mock;
let mockSaveDayStatus: jest.Mock;
let mockLoadStreakData: jest.Mock;
let mockSaveStreakData: jest.Mock;
let mockLoadTimerState: jest.Mock;
let mockSaveTimerState: jest.Mock;
let mockLoadDayStatus: jest.Mock;
let mockSaveDrinkCost: jest.Mock; // Added
let mockLoadDrinkCost: jest.Mock; // Added
let mockClearAllData: jest.Mock; // Added

// Mocks for timer state context
let mockStartTimer: jest.Mock;
let mockStopTimer: jest.Mock;


dayjs.extend(isBetween);
dayjs.extend(utc); // Extend dayjs with UTC plugin

// Helper function to find a day by ID within the weeks structure
const findDayById = (weeks: WeekData[], id: string): DayData | undefined => {
  for (const week of weeks) {
    const day = week.days.find((d: DayData) => d.id === id);
    if (day) return day;
  }
  return undefined;
};

describe('useCalendarData Hook', () => {
  // Centralized beforeEach for all tests within this describe block
  beforeEach(() => {
    // Reset mocks and timers before each test
    jest.useFakeTimers();

    // Initialize mocks for repository methods
    mockLoadAllDayStatus = jest.fn().mockResolvedValue({}); // Use empty object for DayDataMap
    mockSaveDayStatus = jest.fn().mockResolvedValue(undefined);
    mockLoadStreakData = jest.fn().mockResolvedValue({ currentStreak: 0, longestStreak: 0 });
    mockSaveStreakData = jest.fn().mockResolvedValue(undefined);
    mockLoadTimerState = jest.fn().mockResolvedValue({ effectiveStreakStartTimeUTC: null, isTimerActive: false });
    mockSaveTimerState = jest.fn().mockResolvedValue(undefined);
    mockLoadDayStatus = jest.fn().mockResolvedValue(null);
    mockSaveDrinkCost = jest.fn().mockResolvedValue(undefined); // Added init
    mockLoadDrinkCost = jest.fn().mockResolvedValue(0); // Added init, default 0
    mockClearAllData = jest.fn().mockResolvedValue(undefined); // Added init

    // Initialize mocks for TimerStateContext functions
    mockStartTimer = jest.fn();
    mockStopTimer = jest.fn();

    // Configure the mock repository implementation
    MockLocalStorageSobrietyRepository.mockImplementation(() => ({
      loadAllDayStatus: mockLoadAllDayStatus,
      saveDayStatus: mockSaveDayStatus,
      loadStreakData: mockLoadStreakData,
      saveStreakData: mockSaveStreakData,
      loadTimerState: mockLoadTimerState,
      saveTimerState: mockSaveTimerState,
      loadDayStatus: mockLoadDayStatus,
      saveDrinkCost: mockSaveDrinkCost, // Added method
      loadDrinkCost: mockLoadDrinkCost, // Added method
      clearAllData: mockClearAllData, // Added method

      // Keep other required methods minimal if not directly tested here
      // Assuming these might be part of the interface but not used in useCalendarData
      loadSobrietyData: jest.fn(),
      saveSobrietyData: jest.fn(),
      loadFinancialSettings: jest.fn().mockResolvedValue({ dailyDrinkCost: 0 }), // Keep if needed by other parts
      saveFinancialSettings: jest.fn().mockResolvedValue(undefined), // Keep if needed
    } as unknown as ISobrietyDataRepository)); // Cast to satisfy interface if needed, adjust if strict typing causes issues
  });

  afterEach(() => {
    // Clean up timers and mocks after each test
    jest.useRealTimers();
    jest.clearAllMocks();
  });


  // MARK: - Scenario: Initial Calendar Load
  describe('Scenario: Initial Calendar Load', () => {
    // Specific mock setup moved into the relevant test below

    it('should initialize with a deterministic set of weeks, all days non-sober', async () => {
       // Pass necessary mocks via wrapper
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });

       // Wait for the initial weeks data to be populated by the useEffect
       await waitFor(() => {
         expect(result.current.weeks.length).toBe(9); // Adjust if initial range differs

         const today = dayjs();
         const startDate = today.subtract(4, 'week').startOf('week');
         const endDate = today.add(4, 'week').endOf('week');
         let dayCount = 0;

         result.current.weeks.forEach(week => {
           week.days.forEach(day => {
             dayCount++;
             expect(day.sober).toBe(false);
             expect(day.intensity).toBe(0);
             const dayDate = dayjs(day.id);
             expect(dayDate.isBetween(startDate.subtract(1, 'day'), endDate.add(1, 'day'))).toBe(true);
           });
         });
         expect(dayCount).toBe(63);
       });

       await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));
       await waitFor(() => expect(result.current.isLoadingPast).toBe(false));
       await waitFor(() => expect(result.current.isLoadingFuture).toBe(false));
     });

     it('should initialize with zero streaks when all days are non-sober', async () => {
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });

       await waitFor(() => {
         expect(result.current.currentStreak).toBe(0);
         expect(result.current.longestStreak).toBe(0);
       });
     });

     it('should initialize correctly based on data loaded from repository', async () => {
        // --- Setup specific mock data for this test ---
        const today = dayjs();
        const pastStreakStart = today.subtract(15, 'days').format('YYYY-MM-DD');
        const pastStreakEnd = today.subtract(10, 'days').format('YYYY-MM-DD'); // 6-day past streak
        const recentStreakStart = today.subtract(2, 'days').format('YYYY-MM-DD'); // 3-day current streak
        const recentStreakStartTimestamp = today.subtract(2, 'days').startOf('day').valueOf();

        const mockDayStatus: { [key: string]: { sober: boolean; streakStartTimestampUTC: number | null } } = {};
        let currentDay = dayjs(pastStreakStart);
        while (currentDay.isSameOrBefore(pastStreakEnd, 'day')) {
          mockDayStatus[currentDay.format('YYYY-MM-DD')] = { sober: true, streakStartTimestampUTC: null };
          currentDay = currentDay.add(1, 'day');
        }
        currentDay = dayjs(recentStreakStart);
        mockDayStatus[currentDay.format('YYYY-MM-DD')] = { sober: true, streakStartTimestampUTC: recentStreakStartTimestamp };
        currentDay = currentDay.add(1, 'day');
        mockDayStatus[currentDay.format('YYYY-MM-DD')] = { sober: true, streakStartTimestampUTC: null };
        currentDay = currentDay.add(1, 'day'); // Today
        mockDayStatus[currentDay.format('YYYY-MM-DD')] = { sober: true, streakStartTimestampUTC: null };

        // Configure mocks directly before rendering
        mockLoadAllDayStatus.mockResolvedValue(mockDayStatus);
        mockLoadStreakData.mockResolvedValue({ currentStreak: 3, longestStreak: 6 });
        mockStartTimer.mockClear();
        // --- End specific mock setup ---

        // Render the hook with wrapper providing BOTH timer and repository mocks
        const wrapper = createTestWrapper({
          repositoryValue: { // Provide the configured mocks for this test
            loadAllDayStatus: mockLoadAllDayStatus,
            loadStreakData: mockLoadStreakData,
          },
          timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
        });
        const { result } = renderHook(() => useCalendarData(), { wrapper });

        await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));

        await waitFor(() => expect(result.current.currentStreak).toBe(3));
        await waitFor(() => expect(result.current.longestStreak).toBe(6));
        expect(findDayById(result.current.weeks, pastStreakStart)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, pastStreakEnd)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, today.format('YYYY-MM-DD'))?.sober).toBe(true);
        expect(findDayById(result.current.weeks, today.subtract(5, 'days').format('YYYY-MM-DD'))?.sober).toBe(false);
        expect(findDayById(result.current.weeks, today.format('YYYY-MM-DD'))?.intensity).toBe(3);
        expect(findDayById(result.current.weeks, pastStreakEnd)?.intensity).toBe(6);

        expect(mockStartTimer).toHaveBeenCalledTimes(1);
        expect(mockStartTimer).toHaveBeenCalledWith(recentStreakStartTimestamp);
      });
   });

  // MARK: - Scenario: Toggle a Day's Sobriety Status
  describe("Scenario: Toggle a Day's Sobriety Status", () => {
     it('should update the specific day state when toggleSoberDay is called for a past/present day', async () => {
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });
       const dayToToggleId = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

       await waitFor(() => expect(result.current.weeks.length).toBeGreaterThan(0));

       const initialDayState = findDayById(result.current.weeks, dayToToggleId);
       expect(initialDayState).toBeDefined();
       expect(initialDayState!.sober).toBe(false);
       expect(initialDayState!.intensity).toBe(0);

       await act(async () => { // Make act async for toggleSoberDay
         await result.current.toggleSoberDay(dayToToggleId);
       });

       const updatedDayState = findDayById(result.current.weeks, dayToToggleId);
       expect(updatedDayState).toBeDefined();
       expect(updatedDayState!.sober).toBe(true);
       expect(updatedDayState!.intensity).toBe(1);
     });

     it('should recalculate streaks correctly after toggling a single day', async () => {
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });

       await waitFor(() => {
         expect(result.current.currentStreak).toBe(0);
         expect(result.current.longestStreak).toBe(0);
       });

       const dayToToggleId = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

       await act(async () => {
         await result.current.toggleSoberDay(dayToToggleId);
       });

       await waitFor(() => expect(result.current.currentStreak).toBe(0));
       expect(result.current.currentStreak).toBe(0);
       expect(result.current.longestStreak).toBe(1);

       await act(async () => {
         await result.current.toggleSoberDay(dayToToggleId);
       });

       await waitFor(() => expect(result.current.currentStreak).toBe(0));
       expect(result.current.currentStreak).toBe(0);
       expect(result.current.longestStreak).toBe(1);
     });

     it('should reset currentStreak to 0 when today is toggled off after being part of a streak', async () => {
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });
       const todayId = dayjs().format('YYYY-MM-DD');
       const yesterdayId = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

       await waitFor(() => expect(result.current.weeks.length).toBeGreaterThan(0));
       await waitFor(() => expect(result.current.currentStreak).toBe(0));

       await act(async () => { await result.current.toggleSoberDay(yesterdayId); });
       await act(async () => { await result.current.toggleSoberDay(todayId); });

       await waitFor(() => expect(result.current.currentStreak).toBe(2));
       expect(findDayById(result.current.weeks, todayId)?.sober).toBe(true);

       await act(async () => { await result.current.toggleSoberDay(todayId); });

       await waitFor(() => expect(result.current.currentStreak).toBe(0));
       expect(findDayById(result.current.weeks, todayId)?.sober).toBe(false);
       expect(result.current.currentStreak).toBe(0);
       expect(result.current.longestStreak).toBe(2);
     });

   });

   // MARK: - Scenario: Persistence (Future State)
   describe('Scenario: Persistence (Future State)', () => {
     // These tests are placeholders as persistence isn't implemented
     it.skip('should attempt to load data from storage on initialization', () => {
       // Requires mocking storage interaction
     });

     it.skip('should attempt to save data after toggleSoberDay is called', () => {
       // Requires mocking storage interaction and verifying save calls
     });
   });

    // MARK: - Scenario: Streak Calculation Logic
   describe('Scenario: Streak Calculation Logic', () => {
     it('should correctly calculate intensity and streaks when filling a gap', async () => {
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });

       const today = dayjs();
       const day1_id = today.subtract(2, 'day').format('YYYY-MM-DD');
       const day2_id = today.subtract(1, 'day').format('YYYY-MM-DD');
       const day3_id = today.format('YYYY-MM-DD');

       await waitFor(() => expect(result.current.weeks.length).toBeGreaterThan(0));

       expect(findDayById(result.current.weeks, day1_id)?.sober).toBe(false);
       expect(findDayById(result.current.weeks, day2_id)?.sober).toBe(false);
       expect(findDayById(result.current.weeks, day3_id)?.sober).toBe(false);
       expect(result.current.currentStreak).toBe(0);

       await act(async () => { await result.current.toggleSoberDay(day1_id); });
       await act(async () => { await result.current.toggleSoberDay(day3_id); });

       expect(findDayById(result.current.weeks, day1_id)?.sober).toBe(true);
       expect(findDayById(result.current.weeks, day2_id)?.sober).toBe(false);
       expect(findDayById(result.current.weeks, day3_id)?.sober).toBe(true);

       await act(async () => { await result.current.toggleSoberDay(day2_id); });

       await waitFor(() => expect(findDayById(result.current.weeks, day2_id)?.sober).toBe(true));
       await waitFor(() => expect(result.current.currentStreak).toBe(3));

       const finalDay1 = findDayById(result.current.weeks, day1_id);
       const finalDay2 = findDayById(result.current.weeks, day2_id);
       const finalDay3 = findDayById(result.current.weeks, day3_id);

       expect(finalDay1).toBeDefined();
       expect(finalDay2).toBeDefined();
       expect(finalDay3).toBeDefined();
       expect(finalDay1?.sober).toBe(true);
       expect(finalDay2?.sober).toBe(true);
       expect(finalDay3?.sober).toBe(true);
       expect(finalDay1?.intensity).toBe(1);
       expect(finalDay2?.intensity).toBe(2);
       expect(finalDay3?.intensity).toBe(3);
       expect(result.current.currentStreak).toBe(3);
       expect(result.current.longestStreak).toBeGreaterThanOrEqual(3);
     });

     it('should correctly calculate intensity and streaks when breaking a streak', async () => {
        const wrapper = createTestWrapper({
          timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
        });
        const { result } = renderHook(() => useCalendarData(), { wrapper });

        const today = dayjs();
        const day1_id = today.subtract(2, 'day').format('YYYY-MM-DD');
        const day2_id = today.subtract(1, 'day').format('YYYY-MM-DD');
        const day3_id = today.format('YYYY-MM-DD');

        await waitFor(() => expect(result.current.weeks.length).toBeGreaterThan(0));

        await act(async () => { await result.current.toggleSoberDay(day1_id); });
        await act(async () => { await result.current.toggleSoberDay(day2_id); });
        await act(async () => { await result.current.toggleSoberDay(day3_id); });

        await waitFor(() => expect(result.current.currentStreak).toBe(3));

        expect(findDayById(result.current.weeks, day1_id)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, day2_id)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, day3_id)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, day1_id)?.intensity).toBe(1);
        expect(findDayById(result.current.weeks, day2_id)?.intensity).toBe(2);
        expect(findDayById(result.current.weeks, day3_id)?.intensity).toBe(3);
        expect(result.current.currentStreak).toBe(3);
        expect(result.current.longestStreak).toBe(3);

        await act(async () => { await result.current.toggleSoberDay(day2_id); });

        await waitFor(() => expect(findDayById(result.current.weeks, day2_id)?.sober).toBe(false));
        await waitFor(() => expect(result.current.currentStreak).toBe(1));

        const finalDay1 = findDayById(result.current.weeks, day1_id);
        const finalDay2 = findDayById(result.current.weeks, day2_id);
        const finalDay3 = findDayById(result.current.weeks, day3_id);

        expect(finalDay1?.sober).toBe(true);
        expect(finalDay2?.sober).toBe(false);
        expect(finalDay3?.sober).toBe(true);
        expect(finalDay1?.intensity).toBe(1);
        expect(finalDay2?.intensity).toBe(0);
        expect(finalDay3?.intensity).toBe(1);
        expect(result.current.currentStreak).toBe(1);
        expect(result.current.longestStreak).toBe(3);
     });
   });

    // MARK: - Scenario: Prevent Marking Future Dates (BUG-02)
    describe('Scenario: Prevent Marking Future Dates (BUG-02)', () => {
     it('should NOT update state when a future date is toggled', async () => {
       const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });
       const futureDateId = dayjs().add(2, 'day').format('YYYY-MM-DD');

       await waitFor(() => expect(result.current.weeks.length).toBeGreaterThan(0));

       const initialFutureDayState = findDayById(result.current.weeks, futureDateId);
       expect(initialFutureDayState).toBeDefined();
       const initialSoberStatus = initialFutureDayState!.sober;
       const initialIntensity = initialFutureDayState!.intensity;
       expect(initialSoberStatus).toBe(false);

       await act(async () => { await result.current.toggleSoberDay(futureDateId); });

       const updatedFutureDayState = findDayById(result.current.weeks, futureDateId);
       expect(updatedFutureDayState).toBeDefined();
       expect(updatedFutureDayState!.sober).toBe(initialSoberStatus);
       expect(updatedFutureDayState!.intensity).toBe(initialIntensity);

       consoleWarnSpy.mockRestore();
     });
   });

   // MARK: - Scenario: Dynamic Week Loading (BUG-01)
   describe('Scenario: Dynamic Week Loading (BUG-01)', () => {
     const expectedPastWeeksToAdd = 4;
     const expectedFutureWeeksToAdd = 4;

     it('should increase the number of weeks and ensure new days are non-sober when loadPastWeeks is called', async () => {
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });

       await waitFor(() => expect(result.current.weeks.length).toBeGreaterThan(0));

       const initialWeeks = result.current.weeks;
       const initialWeeksCount = initialWeeks.length;

       expect(result.current.isLoadingPast).toBe(false);

       act(() => { result.current.loadPastWeeks(); });

       await waitFor(() => expect(result.current.isLoadingPast).toBe(true));
       await waitFor(() => expect(result.current.weeks.length).toBe(initialWeeksCount + expectedPastWeeksToAdd));
       await waitFor(() => expect(result.current.isLoadingPast).toBe(false));

       const finalWeeksPast = result.current.weeks;
       expect(finalWeeksPast.length).toBe(initialWeeksCount + expectedPastWeeksToAdd);

       const addedPastWeeks = finalWeeksPast.slice(0, expectedPastWeeksToAdd);
       addedPastWeeks.forEach(week => {
         week.days.forEach(day => {
           expect(day.sober).toBe(false);
           expect(day.intensity).toBe(0);
         });
       });

       const firstWeekStartDate = dayjs(result.current.weeks[0].days[0].id);
       const initialFirstWeekStartDate = dayjs(initialWeeks[0].days[0].id);
       expect(firstWeekStartDate.isBefore(initialFirstWeekStartDate)).toBe(true);
     });

     it('should increase the number of weeks and ensure new days are non-sober when loadFutureWeeks is called', async () => {
       const wrapper = createTestWrapper({
         timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
       });
       const { result } = renderHook(() => useCalendarData(), { wrapper });

       await waitFor(() => expect(result.current.weeks.length).toBeGreaterThan(0));

       const initialWeeks = result.current.weeks;
       const initialWeeksCount = initialWeeks.length;

       expect(result.current.isLoadingFuture).toBe(false);

       act(() => { result.current.loadFutureWeeks(); });

       await waitFor(() => expect(result.current.isLoadingFuture).toBe(true));
       await waitFor(() => expect(result.current.weeks.length).toBe(initialWeeksCount + expectedFutureWeeksToAdd));
       await waitFor(() => expect(result.current.isLoadingFuture).toBe(false));

       const finalWeeksFuture = result.current.weeks;
       expect(finalWeeksFuture.length).toBe(initialWeeksCount + expectedFutureWeeksToAdd);

       const addedFutureWeeks = finalWeeksFuture.slice(initialWeeksCount);
       addedFutureWeeks.forEach(week => {
         week.days.forEach(day => {
           expect(day.sober).toBe(false);
           expect(day.intensity).toBe(0);
         });
       });

       const lastWeekEndDate = dayjs(result.current.weeks[result.current.weeks.length - 1].days[6].id);
       const initialLastWeekEndDate = dayjs(initialWeeks[initialWeeksCount - 1].days[6].id);
       expect(lastWeekEndDate.isAfter(initialLastWeekEndDate)).toBe(true);
     });

     it('should correctly calculate streaks across newly loaded past week boundaries', async () => {
        const wrapper = createTestWrapper({
          timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
        });
        const { result } = renderHook(() => useCalendarData(), { wrapper });

        await waitFor(() => expect(result.current.weeks.length).toBe(9));

        const initialFirstDayId = result.current.weeks[0].days[0].id;
        const dayBeforeInitialFirstDayId = dayjs(initialFirstDayId).subtract(1, 'day').format('YYYY-MM-DD');

        await act(async () => { await result.current.toggleSoberDay(initialFirstDayId); });
        await waitFor(() => expect(findDayById(result.current.weeks, initialFirstDayId)?.sober).toBe(true));
        await waitFor(() => expect(result.current.longestStreak).toBeGreaterThanOrEqual(1));

        act(() => { result.current.loadPastWeeks(); });
        await waitFor(() => expect(result.current.weeks.length).toBe(9 + 4));

        await act(async () => { await result.current.toggleSoberDay(dayBeforeInitialFirstDayId); });

        await waitFor(() => expect(findDayById(result.current.weeks, dayBeforeInitialFirstDayId)?.sober).toBe(true));

        const dayBeforeIntensity = findDayById(result.current.weeks, dayBeforeInitialFirstDayId)?.intensity;
        const firstDayIntensity = findDayById(result.current.weeks, initialFirstDayId)?.intensity;

        expect(result.current.longestStreak).toBeGreaterThanOrEqual(2);
        expect(findDayById(result.current.weeks, dayBeforeInitialFirstDayId)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, initialFirstDayId)?.sober).toBe(true);
        expect(dayBeforeIntensity).toBe(1);
        expect(firstDayIntensity).toBeGreaterThanOrEqual(2);
      });
   });



// MARK: - Scenario: Sobriety Timer Logic
describe('Scenario: Sobriety Timer Logic', () => {
  // Mocks are now initialized in the top-level beforeEach

  it('testStartTimer_WhenTodayToggledSober_StartsFromExactTimestamp', async () => {
    const wrapper = createTestWrapper({
      timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
    });
    const { result } = renderHook(() => useCalendarData(), { wrapper });
    const todayId = dayjs().format('YYYY-MM-DD');

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));
    expect(result.current.currentStreak).toBe(0);
    expect(mockStartTimer).not.toHaveBeenCalled();

    const beforeToggleTimestamp = dayjs().valueOf();
    await act(async () => { await result.current.toggleSoberDay(todayId); });
    const afterToggleTimestamp = dayjs().valueOf();

    await waitFor(() => expect(result.current.currentStreak).toBe(1));
    expect(mockStopTimer).toHaveBeenCalled();
    expect(mockStartTimer).toHaveBeenCalledTimes(1);

    const startTimestampArg = mockStartTimer.mock.calls[0][0];
    expect(startTimestampArg).toBeGreaterThanOrEqual(beforeToggleTimestamp);
    expect(startTimestampArg).toBeLessThanOrEqual(afterToggleTimestamp);

    const todayState = findDayById(result.current.weeks, todayId);
    expect(todayState?.sober).toBe(true);
    expect(todayState?.streakStartTimestampUTC).toBe(startTimestampArg);
  });


  it('testContinueTimer_WhenTodayToggledSoberAndYesterdaySober_UsesExistingStreakStart', async () => {
    const yesterdayId = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const todayId = dayjs().format('YYYY-MM-DD');
    const yesterdayStartTimestamp = dayjs().subtract(1, 'day').startOf('day').valueOf();

    mockLoadAllDayStatus.mockResolvedValue({
      [yesterdayId]: { sober: true, streakStartTimestampUTC: yesterdayStartTimestamp },
    });
    mockLoadStreakData.mockResolvedValue({ currentStreak: 0, longestStreak: 1 });

    const wrapper = createTestWrapper({
      repositoryValue: { // Provide the configured mocks for this test
        loadAllDayStatus: mockLoadAllDayStatus,
        loadStreakData: mockLoadStreakData,
      },
      timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
    });
    const { result } = renderHook(() => useCalendarData(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));
    expect(result.current.currentStreak).toBe(0);
    await waitFor(() => expect(result.current.longestStreak).toBe(1));
    expect(mockStartTimer).not.toHaveBeenCalled();

    await act(async () => { await result.current.toggleSoberDay(todayId); });

    await waitFor(() => expect(result.current.currentStreak).toBe(2));
    expect(mockStopTimer).toHaveBeenCalled();
    expect(mockStartTimer).toHaveBeenCalledTimes(1);
    expect(mockStartTimer).toHaveBeenCalledWith(yesterdayStartTimestamp);

    expect(findDayById(result.current.weeks, yesterdayId)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, todayId)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, todayId)?.streakStartTimestampUTC).toBeNull();
  });


  it('testRecalculateTimer_WhenGapFilledCausesMidnightStart_UsesBackfilledDayMidnight', async () => {
    const day1Id = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
    const day2Id = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const day3Id = dayjs().format('YYYY-MM-DD');
    const day1StartTimestamp = dayjs(day1Id).startOf('day').valueOf();

    mockLoadAllDayStatus.mockResolvedValue({
      [day1Id]: { sober: true, streakStartTimestampUTC: day1StartTimestamp },
      [day3Id]: { sober: true, streakStartTimestampUTC: dayjs(day3Id).startOf('day').valueOf() },
    });
    mockLoadStreakData.mockResolvedValue({ currentStreak: 1, longestStreak: 1 });

    const wrapper = createTestWrapper({
      repositoryValue: { // Provide the configured mocks for this test
        loadAllDayStatus: mockLoadAllDayStatus,
        loadStreakData: mockLoadStreakData,
      },
      timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
    });
    const { result } = renderHook(() => useCalendarData(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));
    await waitFor(() => expect(result.current.currentStreak).toBe(1));
    expect(mockStartTimer).toHaveBeenCalledTimes(1);
    expect(mockStartTimer).toHaveBeenCalledWith(dayjs(day3Id).startOf('day').valueOf());
    mockStartTimer.mockClear();

    await act(async () => { await result.current.toggleSoberDay(day2Id); });

    await waitFor(() => expect(result.current.currentStreak).toBe(3));
    expect(mockStopTimer).toHaveBeenCalled();
    expect(mockStartTimer).toHaveBeenCalledTimes(1);
    expect(mockStartTimer).toHaveBeenCalledWith(day1StartTimestamp);

    expect(findDayById(result.current.weeks, day1Id)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, day2Id)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, day3Id)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, day2Id)?.streakStartTimestampUTC).toBeNull();
  });


  it('testRecalculateTimer_WhenGapFilledConnectsStreaks_UsesEarlierPreciseTimestamp', async () => {
    const day1Id = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
    const day2Id = dayjs().subtract(2, 'day').format('YYYY-MM-DD');
    const day3Id = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const day4Id = dayjs().format('YYYY-MM-DD');

    const day1StartTimestamp = dayjs(day1Id).set('hour', 10).valueOf();
    const day4StartTimestamp = dayjs(day4Id).set('hour', 8).valueOf();

    mockLoadAllDayStatus.mockResolvedValue({
      [day1Id]: { sober: true, streakStartTimestampUTC: day1StartTimestamp },
      [day2Id]: { sober: true, streakStartTimestampUTC: null },
      [day4Id]: { sober: true, streakStartTimestampUTC: day4StartTimestamp },
    });
    mockLoadStreakData.mockResolvedValue({ currentStreak: 1, longestStreak: 2 });

    const wrapper = createTestWrapper({
      repositoryValue: { // Provide the configured mocks for this test
        loadAllDayStatus: mockLoadAllDayStatus,
        loadStreakData: mockLoadStreakData,
      },
      timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
    });
    const { result } = renderHook(() => useCalendarData(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));
    await waitFor(() => expect(result.current.currentStreak).toBe(1));
    expect(result.current.longestStreak).toBe(2);
    expect(mockStartTimer).toHaveBeenCalledTimes(1);
    expect(mockStartTimer).toHaveBeenCalledWith(day4StartTimestamp);
    mockStartTimer.mockClear();

    await act(async () => { await result.current.toggleSoberDay(day3Id); });

    await waitFor(() => expect(result.current.currentStreak).toBe(4));
    expect(mockStopTimer).toHaveBeenCalled();
    expect(mockStartTimer).toHaveBeenCalledTimes(1);
    expect(mockStartTimer).toHaveBeenCalledWith(dayjs(day1Id).startOf('day').valueOf());

    expect(findDayById(result.current.weeks, day1Id)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, day2Id)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, day3Id)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, day4Id)?.sober).toBe(true);
    expect(findDayById(result.current.weeks, day3Id)?.streakStartTimestampUTC).toBeNull();
  });


  it('testResetTimer_WhenTodayToggledNotSober_ResetsTimerStateAndTimestamp', async () => {
    const yesterdayId = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const todayId = dayjs().format('YYYY-MM-DD');
    const yesterdayStartTimestamp = dayjs(yesterdayId).startOf('day').valueOf();

    mockLoadAllDayStatus.mockResolvedValue({
      [yesterdayId]: { sober: true, streakStartTimestampUTC: yesterdayStartTimestamp },
      [todayId]: { sober: true, streakStartTimestampUTC: null },
    });
    mockLoadStreakData.mockResolvedValue({ currentStreak: 2, longestStreak: 2 });

    const wrapper = createTestWrapper({
      repositoryValue: { // Provide the configured mocks for this test
        loadAllDayStatus: mockLoadAllDayStatus,
        loadStreakData: mockLoadStreakData,
      },
      timerStateValue: { startTimer: mockStartTimer, stopTimer: mockStopTimer }
    });
    const { result } = renderHook(() => useCalendarData(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingInitial).toBe(false));
    await waitFor(() => expect(result.current.currentStreak).toBe(2));
    expect(mockStartTimer).toHaveBeenCalledTimes(1);
    expect(mockStartTimer).toHaveBeenCalledWith(yesterdayStartTimestamp);
    mockStartTimer.mockClear();

    await act(async () => { await result.current.toggleSoberDay(todayId); });

    await waitFor(() => expect(result.current.currentStreak).toBe(0));
    expect(mockStopTimer).toHaveBeenCalled();
    expect(mockStartTimer).not.toHaveBeenCalled();

    const todayState = findDayById(result.current.weeks, todayId);
    expect(todayState?.sober).toBe(false);
    expect(todayState?.streakStartTimestampUTC).toBeNull();
  });

}); // End of describe('Scenario: Sobriety Timer Logic')

}); // End of describe('useCalendarData Hook')
