// lib/services/__tests__/financial-service.test.ts
import { calculateSavings } from '../financial-service'; // Will fail until file exists

// Constants for testing
const MOCK_PRICE_PER_DRINK = 5;
const MOCK_WEEKLY_DRINKS = 14; // 2 drinks per day * 7 days
const MOCK_DAILY_DRINKS = 2; // MOCK_WEEKLY_DRINKS / 7
const MOCK_SAVINGS_PER_DAY = MOCK_PRICE_PER_DRINK * MOCK_DAILY_DRINKS; // $10

describe('Financial Service', () => {
  // MARK: - Scenario: Calculate Savings
  describe('calculateSavings', () => {
    // Scenario 1: Calculate Savings with Positive Sober Days and Weekly Drinks
    it('should calculate total savings correctly using weekly drinks quantity', () => {
      const soberDays = 10;
      const expectedSavings = MOCK_SAVINGS_PER_DAY * soberDays; // 10 * 10 = 100
      expect(calculateSavings(soberDays, MOCK_WEEKLY_DRINKS)).toBe(expectedSavings);
    });

    // Scenario 2: Calculate Savings with Zero Sober Days
    it('should return 0 savings when there are zero sober days', () => {
      const soberDays = 0;
      expect(calculateSavings(soberDays, MOCK_WEEKLY_DRINKS)).toBe(0);
    });

    // Scenario 3: Handle Negative Sober Days
    it('should return 0 savings for negative sober days', () => {
      const soberDays = -5;
      expect(calculateSavings(soberDays, MOCK_WEEKLY_DRINKS)).toBe(0);
    });

    // Scenario 4: Handle Null Weekly Drinks
    it('should return 0 savings when weekly drinks is null', () => {
      const soberDays = 7;
      expect(calculateSavings(soberDays, null)).toBe(0);
    });

    // Scenario 5: Handle Undefined Weekly Drinks
    it('should return 0 savings when weekly drinks is undefined', () => {
      const soberDays = 7;
      expect(calculateSavings(soberDays, undefined)).toBe(0);
    });

    // Scenario 6: Handle Zero Weekly Drinks
    it('should calculate zero savings when weekly drinks is 0', () => {
      const soberDays = 7;
      expect(calculateSavings(soberDays, 0)).toBe(0);
    });

    // Scenario 7: Handle Decimal Weekly Drinks
    it('should round daily drinks to 2 decimal places for decimal weekly drinks', () => {
      const soberDays = 7;
      const weeklyDrinks = 10; // Results in ~1.43 drinks per day
      const dailyDrinks = Number((weeklyDrinks / 7).toFixed(2));
      const expectedSavings = Math.round(soberDays * dailyDrinks * MOCK_PRICE_PER_DRINK);
      expect(calculateSavings(soberDays, weeklyDrinks)).toBe(expectedSavings);
    });

    // Scenario 8: Handle Large Numbers
    it('should handle large numbers without floating point errors', () => {
      const soberDays = 365; // One year
      const weeklyDrinks = 28; // 4 per day
      const dailyDrinks = 4;
      const expectedSavings = soberDays * dailyDrinks * MOCK_PRICE_PER_DRINK;
      expect(calculateSavings(soberDays, weeklyDrinks)).toBe(expectedSavings);
    });
  });
});