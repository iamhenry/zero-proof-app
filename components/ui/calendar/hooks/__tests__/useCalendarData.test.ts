import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native'; // Import waitFor from react-native
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useCalendarData } from '../useCalendarData';
import { DayData, WeekData } from '../../types';

dayjs.extend(isBetween);

// Helper function to find a day by ID within the weeks structure
const findDayById = (weeks: WeekData[], id: string): DayData | undefined => {
  for (const week of weeks) {
    const day = week.days.find((d: DayData) => d.id === id);
    if (day) return day;
  }
  return undefined;
};

describe('useCalendarData Hook', () => {
  // MARK: - Scenario: Initial Calendar Load
  describe('Scenario: Initial Calendar Load', () => {
    it('should initialize with a deterministic set of weeks, all days non-sober', () => {
       const { result } = renderHook(() => useCalendarData());

       // Expect a specific number of initial weeks (e.g., 9 weeks: 4 past, 1 current, 4 future)
       // This number should match the deterministic logic in the refactored hook.
       expect(result.current.weeks.length).toBe(9); // Adjust if initial range differs

       const today = dayjs();
       const startDate = today.subtract(4, 'week').startOf('week');
       const endDate = today.add(4, 'week').endOf('week');
       let dayCount = 0;

       // Verify all days within the initial range are present and non-sober
       result.current.weeks.forEach(week => {
         week.days.forEach(day => {
           dayCount++;
           expect(day.sober).toBe(false);
           expect(day.intensity).toBe(0);
           const dayDate = dayjs(day.id);
           expect(dayDate.isBetween(startDate.subtract(1, 'day'), endDate.add(1, 'day'))).toBe(true); // Check date is within expected range
         });
       });

       // Expect 9 weeks * 7 days = 63 days
       expect(dayCount).toBe(63); // Adjust if initial range differs

       expect(result.current.isLoadingInitial).toBe(false); // Should not be loading after init
       expect(result.current.isLoadingPast).toBe(false);
       expect(result.current.isLoadingFuture).toBe(false);
     });

     it('should initialize with zero streaks when all days are non-sober', () => {
       const { result } = renderHook(() => useCalendarData());
       // Expect streaks to be 0 initially
       expect(result.current.currentStreak).toBe(0);
       expect(result.current.longestStreak).toBe(0);
     });
   });

  // MARK: - Scenario: Toggle a Day's Sobriety Status
  describe("Scenario: Toggle a Day's Sobriety Status", () => {
     it('should update the specific day state when toggleSoberDay is called for a past/present day', () => {
       const { result } = renderHook(() => useCalendarData());
       const dayToToggleId = dayjs().subtract(1, 'day').format('YYYY-MM-DD'); // Yesterday

       // Find the initial state of the day (should be non-sober)
       const initialDayState = findDayById(result.current.weeks, dayToToggleId);
       expect(initialDayState).toBeDefined();
       expect(initialDayState!.sober).toBe(false); // Verify initial state
       expect(initialDayState!.intensity).toBe(0);

       act(() => {
         result.current.toggleSoberDay(dayToToggleId);
       });

       // Find the updated state of the day
       const updatedDayState = findDayById(result.current.weeks, dayToToggleId);
       expect(updatedDayState).toBeDefined();
       // Assert the sober status has flipped
       expect(updatedDayState!.sober).toBe(true);
       // Intensity should also update (likely to 1 for a single day)
       expect(updatedDayState!.intensity).toBe(1);
     });

     it('should recalculate streaks correctly after toggling a single day', () => {
       const { result } = renderHook(() => useCalendarData());
       // Initial state: streaks are 0
       expect(result.current.currentStreak).toBe(0);
       expect(result.current.longestStreak).toBe(0);

       const dayToToggleId = dayjs().subtract(1, 'day').format('YYYY-MM-DD'); // Yesterday

       act(() => {
         result.current.toggleSoberDay(dayToToggleId);
       });

       // Assert streaks are updated for the single toggled day
       expect(result.current.currentStreak).toBe(1);
       expect(result.current.longestStreak).toBe(1);

       // Toggle it back off
       act(() => {
         result.current.toggleSoberDay(dayToToggleId);
       });

       // Assert streaks go back to 0
       expect(result.current.currentStreak).toBe(0);
       expect(result.current.longestStreak).toBe(1); // Longest remains 1
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
     // Test case based on MEMORY.md and BDD scenarios
     it('should correctly calculate intensity and streaks when filling a gap', () => {
       const { result } = renderHook(() => useCalendarData());

       // Define the dates for the gap scenario (relative to today)
       const today = dayjs();
       const day1_id = today.subtract(2, 'day').format('YYYY-MM-DD');
       const day2_id = today.subtract(1, 'day').format('YYYY-MM-DD'); // The gap
       const day3_id = today.format('YYYY-MM-DD');

       // --- Setup Phase ---
       // Start from the default state (all non-sober)
       expect(findDayById(result.current.weeks, day1_id)?.sober).toBe(false);
       expect(findDayById(result.current.weeks, day2_id)?.sober).toBe(false);
       expect(findDayById(result.current.weeks, day3_id)?.sober).toBe(false);
       expect(result.current.currentStreak).toBe(0);

       // Use toggleSoberDay via `act` to establish the desired initial state:
       // day1 = sober, day2 = not sober, day3 = sober
       act(() => {
         result.current.toggleSoberDay(day1_id); // Make day1 sober
       });
       act(() => {
         result.current.toggleSoberDay(day3_id); // Make day3 sober
       });

       // Optional: Verify the setup state before the main action
       expect(findDayById(result.current.weeks, day1_id)?.sober).toBe(true);
       expect(findDayById(result.current.weeks, day2_id)?.sober).toBe(false); // Gap day remains non-sober       e
        expect(findDayById(result.current.weeks, day3_id)?.sober).toBe(true);

       // --- Action Phase ---
       // Toggle the middle day (day2) to fill the gap and form a continuous streak
       act(() => {
         result.current.toggleSoberDay(day2_id);
       });

       // --- Assertion Phase ---
       // Find the final states of the days after the action
       const finalDay1 = findDayById(result.current.weeks, day1_id);
       const finalDay2 = findDayById(result.current.weeks, day2_id);
       const finalDay3 = findDayById(result.current.weeks, day3_id);

       expect(finalDay1).toBeDefined();
       expect(finalDay2).toBeDefined();
       expect(finalDay3).toBeDefined();

       // Verify all three days are now marked as sober
       expect(finalDay1?.sober).toBe(true);
       expect(finalDay2?.sober).toBe(true);
       expect(finalDay3?.sober).toBe(true);

       // *** Core Assertion: Verify Intensity reflects the continuous streak ***
       // According to BDD Scenario 2 & 3, intensity should increase for consecutive days.
       // Expected: day1=1, day2=2, day3=3 (assuming this forms the most recent streak)
       expect(finalDay1?.intensity).toBe(1); // Start of the 3-day streak
       expect(finalDay2?.intensity).toBe(2); // Middle of the 3-day streak
       expect(finalDay3?.intensity).toBe(3); // End of the 3-day streak

       // Verify overall streak calculation reflects the new 3-day streak
       // (Assuming these are the most recent days influencing the current streak)
       expect(result.current.currentStreak).toBe(3);
       // Longest streak should be at least 3 now
       expect(result.current.longestStreak).toBeGreaterThanOrEqual(3);
     });

     it('should correctly calculate intensity and streaks when breaking a streak', () => {
        const { result } = renderHook(() => useCalendarData());

        const today = dayjs();
        const day1_id = today.subtract(2, 'day').format('YYYY-MM-DD');
        const day2_id = today.subtract(1, 'day').format('YYYY-MM-DD'); // Day to break streak
        const day3_id = today.format('YYYY-MM-DD');

        // --- Setup Phase ---
        // Establish an initial 3-day streak
        act(() => { result.current.toggleSoberDay(day1_id); });
        act(() => { result.current.toggleSoberDay(day2_id); });
        act(() => { result.current.toggleSoberDay(day3_id); });

        // Verify setup
        expect(findDayById(result.current.weeks, day1_id)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, day2_id)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, day3_id)?.sober).toBe(true);
        expect(findDayById(result.current.weeks, day1_id)?.intensity).toBe(1);
        expect(findDayById(result.current.weeks, day2_id)?.intensity).toBe(2);
        expect(findDayById(result.current.weeks, day3_id)?.intensity).toBe(3);
        expect(result.current.currentStreak).toBe(3);
        expect(result.current.longestStreak).toBe(3);

        // --- Action Phase ---
        // Toggle the middle day (day2) OFF to break the streak
        act(() => {
          result.current.toggleSoberDay(day2_id);
        });

        // --- Assertion Phase ---
        const finalDay1 = findDayById(result.current.weeks, day1_id);
        const finalDay2 = findDayById(result.current.weeks, day2_id);
        const finalDay3 = findDayById(result.current.weeks, day3_id);

        expect(finalDay1?.sober).toBe(true);
        expect(finalDay2?.sober).toBe(false); // Streak broken
        expect(finalDay3?.sober).toBe(true);

        // Intensity should reset or adjust based on new streaks
        expect(finalDay1?.intensity).toBe(1); // Now a 1-day streak
        expect(finalDay2?.intensity).toBe(0); // Non-sober day
        expect(finalDay3?.intensity).toBe(1); // Now a 1-day streak starting today

        // Current streak should be 1 (today's streak)
        expect(result.current.currentStreak).toBe(1);
        // Longest streak remains 3
        expect(result.current.longestStreak).toBe(3);
     });
   });

    // MARK: - Scenario: Prevent Marking Future Dates (BUG-02)
    describe('Scenario: Prevent Marking Future Dates (BUG-02)', () => {
     // This test verifies the hook *prevents* toggling future dates.
     it('should NOT update state when a future date is toggled', () => {
       const { result } = renderHook(() => useCalendarData());
       const futureDateId = dayjs().add(2, 'day').format('YYYY-MM-DD');

       // Find initial state (should be non-sober)
       const initialFutureDayState = findDayById(result.current.weeks, futureDateId);
       expect(initialFutureDayState).toBeDefined(); // Ensure it exists in the initial deterministic range
       const initialSoberStatus = initialFutureDayState!.sober;
       const initialIntensity = initialFutureDayState!.intensity;
       expect(initialSoberStatus).toBe(false); // Assuming initial is false

       act(() => {
         result.current.toggleSoberDay(futureDateId);
       });

       // Find updated state
       const updatedFutureDayState = findDayById(result.current.weeks, futureDateId);
       expect(updatedFutureDayState).toBeDefined();
       // Verify the state did NOT change
       expect(updatedFutureDayState!.sober).toBe(initialSoberStatus);
       expect(updatedFutureDayState!.intensity).toBe(initialIntensity);
     });
   });

   // MARK: - Scenario: Dynamic Week Loading (BUG-01)
   describe('Scenario: Dynamic Week Loading (BUG-01)', () => {
     const expectedPastWeeksToAdd = 4; // Assuming INITIAL_PAST_WEEKS_TO_LOAD = 4
     const expectedFutureWeeksToAdd = 4; // Assuming INITIAL_FUTURE_WEEKS_TO_LOAD = 4

     it('should increase the number of weeks and ensure new days are non-sober when loadPastWeeks is called', async () => {
       const { result } = renderHook(() => useCalendarData());
       const initialWeeks = result.current.weeks; // Store initial state
       const initialWeeksCount = initialWeeks.length;

       // Optional: Check initial loading state
       expect(result.current.isLoadingPast).toBe(false);

       act(() => {
         result.current.loadPastWeeks();
       });

       // Check loading state during the process
       // Need to wait for the state update that sets isLoadingPast to true
       await waitFor(() => expect(result.current.isLoadingPast).toBe(true));

       // Check final loading state and week count
       // Need to wait for the state update that sets isLoadingPast back to false and updates weeks
       await waitFor(() => expect(result.current.isLoadingPast).toBe(false));
       const finalWeeksPast = result.current.weeks;
       expect(finalWeeksPast.length).toBe(initialWeeksCount + expectedPastWeeksToAdd);

       // Verify newly added past weeks have default non-sober state
       const addedPastWeeks = finalWeeksPast.slice(0, expectedPastWeeksToAdd);
       addedPastWeeks.forEach(week => {
         week.days.forEach(day => {
           expect(day.sober).toBe(false); // Assert default state
           expect(day.intensity).toBe(0); // Assert default intensity
         });
       });

       // Optional: Verify the added weeks are indeed in the past
       const firstWeekStartDate = dayjs(result.current.weeks[0].days[0].id);
       const initialFirstWeekStartDate = dayjs(initialWeeks[0].days[0].id); // Use stored initial state
       expect(firstWeekStartDate.isBefore(initialFirstWeekStartDate)).toBe(true);
     });

     it('should increase the number of weeks and ensure new days are non-sober when loadFutureWeeks is called', async () => {
       const { result } = renderHook(() => useCalendarData());
       const initialWeeks = result.current.weeks; // Store initial state
       const initialWeeksCount = initialWeeks.length;


       // Optional: Check initial loading state
       expect(result.current.isLoadingFuture).toBe(false);

       act(() => {
         result.current.loadFutureWeeks();
       });

        // Check loading state during the process
       await waitFor(() => expect(result.current.isLoadingFuture).toBe(true));

       // Check final loading state and week count
       await waitFor(() => expect(result.current.isLoadingFuture).toBe(false));
       const finalWeeksFuture = result.current.weeks;
       expect(finalWeeksFuture.length).toBe(initialWeeksCount + expectedFutureWeeksToAdd);

       // Verify newly added future weeks have default non-sober state
       const addedFutureWeeks = finalWeeksFuture.slice(initialWeeksCount);
       addedFutureWeeks.forEach(week => {
         week.days.forEach(day => {
           expect(day.sober).toBe(false); // Assert default state
           expect(day.intensity).toBe(0); // Assert default intensity
         });
       });

       // Optional: Verify the added weeks are indeed in the future
       const lastWeekEndDate = dayjs(result.current.weeks[result.current.weeks.length - 1].days[6].id);
       const initialLastWeekEndDate = dayjs(initialWeeks[initialWeeksCount - 1].days[6].id); // Use stored initial state
       expect(lastWeekEndDate.isAfter(initialLastWeekEndDate)).toBe(true);
     });
   });

});