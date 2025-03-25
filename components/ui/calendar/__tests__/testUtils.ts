import { CalendarData, DayData, WeekData } from '../types';

export const createMockDayData = (overrides?: Partial<DayData>): DayData => ({
  id: '2024-1-1',
  date: '2024-01-01',
  day: 1,
  month: 0,
  year: 2024,
  sober: false,
  intensity: 0,
  isFirstOfMonth: true,
  ...overrides,
});

export const createMockWeekData = (overrides?: Partial<WeekData>): WeekData => ({
  id: 'week-1',
  days: Array(7).fill(null).map((_, index) => createMockDayData({
    id: `2024-1-${index + 1}`,
    date: `2024-01-${String(index + 1).padStart(2, '0')}`,
    day: index + 1,
    isFirstOfMonth: index === 0,
  })),
  ...overrides,
});

export const createMockCalendarData = (overrides?: Partial<CalendarData>): CalendarData => ({
  weeks: Array(5).fill(null).map((_, weekIndex) => createMockWeekData({
    id: `week-${weekIndex + 1}`,
    days: Array(7).fill(null).map((_, dayIndex) => {
      const dayNumber = weekIndex * 7 + dayIndex + 1;
      return createMockDayData({
        id: `2024-1-${dayNumber}`,
        date: `2024-01-${String(dayNumber).padStart(2, '0')}`,
        day: dayNumber,
        isFirstOfMonth: dayNumber === 1,
      });
    }),
  })),
  ...overrides,
});

// Adding a simple test suite to satisfy Jest's requirement
describe('Test Utilities', () => {
  test('createMockDayData creates a day object', () => {
    const day = createMockDayData();
    expect(day).toBeDefined();
    expect(day.id).toBe('2024-1-1');
  });

  test('createMockDayData applies overrides', () => {
    const day = createMockDayData({ day: 15, sober: true });
    expect(day.day).toBe(15);
    expect(day.sober).toBe(true);
  });
}); 