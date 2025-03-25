import { createMockDayData, createMockWeekData, createMockCalendarData } from './testUtils';

describe('Test Utilities', () => {
  test('createMockDayData creates correct structure', () => {
    const mockDay = createMockDayData();
    expect(mockDay).toEqual({
      id: '2024-1-1',
      date: '2024-01-01',
      day: 1,
      month: 0,
      year: 2024,
      sober: false,
      intensity: 0,
      isFirstOfMonth: true,
    });
  });

  test('createMockDayData accepts overrides', () => {
    const mockDay = createMockDayData({
      day: 15,
      sober: true,
      intensity: 5,
    });
    expect(mockDay).toEqual({
      id: '2024-1-1',
      date: '2024-01-01',
      day: 15,
      month: 0,
      year: 2024,
      sober: true,
      intensity: 5,
      isFirstOfMonth: true,
    });
  });

  test('createMockWeekData creates correct structure', () => {
    const mockWeek = createMockWeekData();
    expect(mockWeek.id).toBe('week-1');
    expect(mockWeek.days).toHaveLength(7);
    expect(mockWeek.days[0].isFirstOfMonth).toBe(true);
    expect(mockWeek.days[1].isFirstOfMonth).toBe(false);
  });

  test('createMockCalendarData creates correct structure', () => {
    const mockCalendar = createMockCalendarData();
    expect(mockCalendar.weeks).toHaveLength(5);
    expect(mockCalendar.weeks[0].days).toHaveLength(7);
    expect(mockCalendar.weeks[0].days[0].isFirstOfMonth).toBe(true);
  });
}); 