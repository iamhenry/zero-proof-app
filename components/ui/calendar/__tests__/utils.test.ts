import {
  getIntensityColor,
  getTextColorClass,
  getDayStatus,
  getStatusTextColor,
  getMonthName,
} from '../utils';

describe('Calendar Utils', () => {
  describe('getIntensityColor', () => {
    test('returns empty string for intensity 0', () => {
      expect(getIntensityColor(0)).toBe('');
    });

    test('returns correct color classes for different intensities', () => {
      expect(getIntensityColor(1)).toBe('bg-green-50');
      expect(getIntensityColor(5)).toBe('bg-green-400');
      expect(getIntensityColor(10)).toBe('bg-green-900');
    });

    test('returns empty string for invalid intensity', () => {
      expect(getIntensityColor(11)).toBe('');
      expect(getIntensityColor(-1)).toBe('');
    });
  });

  describe('getTextColorClass', () => {
    test('returns light text for high intensities', () => {
      expect(getTextColorClass(5)).toBe('text-green-100');
      expect(getTextColorClass(10)).toBe('text-green-100');
    });

    test('returns dark text for low intensities', () => {
      expect(getTextColorClass(1)).toBe('text-green-600');
      expect(getTextColorClass(4)).toBe('text-green-600');
    });

    test('returns default color for intensity 0', () => {
      expect(getTextColorClass(0)).toBe('text-stone-300');
    });
  });

  describe('getDayStatus', () => {
    beforeEach(() => {
      // Mock current date to 2024-03-25
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2024, 2, 25));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('identifies today correctly', () => {
      expect(getDayStatus('2024-3-25')).toBe('today');
    });

    test('identifies past days correctly', () => {
      expect(getDayStatus('2024-3-24')).toBe('past');
      expect(getDayStatus('2024-2-1')).toBe('past');
    });

    test('identifies future days correctly', () => {
      expect(getDayStatus('2024-3-26')).toBe('future');
      expect(getDayStatus('2024-4-1')).toBe('future');
    });
  });

  describe('getStatusTextColor', () => {
    test('returns correct colors for different statuses', () => {
      expect(getStatusTextColor('today')).toBe('text-sky-500');
      expect(getStatusTextColor('past')).toBe('text-stone-300');
      expect(getStatusTextColor('future')).toBe('text-neutral-700');
    });

    test('returns default color for invalid status', () => {
      expect(getStatusTextColor('invalid' as any)).toBe('text-stone-300');
    });
  });

  describe('getMonthName', () => {
    test('returns correct month names', () => {
      expect(getMonthName(0)).toBe('Jan');
      expect(getMonthName(6)).toBe('Jul');
      expect(getMonthName(11)).toBe('Dec');
    });

    test('handles invalid month numbers', () => {
      expect(getMonthName(-1)).toBeUndefined();
      expect(getMonthName(12)).toBeUndefined();
    });
  });
}); 