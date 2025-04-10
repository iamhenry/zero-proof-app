// lib/services/__tests__/financial-service.test.ts
import { calculateSavings } from '../financial-service'; // Will fail until file exists

// Constants for testing (as per prompt instructions)
const MOCK_PRICE_PER_DRINK = 5;
const MOCK_DRINKS_PER_DAY = 2;
const MOCK_SAVINGS_PER_DAY = MOCK_PRICE_PER_DRINK * MOCK_DRINKS_PER_DAY; // $10

describe('Financial Service', () => {
  // MARK: - Scenario: Calculate Savings
  describe('calculateSavings', () => {
    // Scenario 1: Calculate Savings with Positive Sober Days
    it('should calculate total savings correctly for a given number of sober days', () => {
      const soberDays = 10;
      const expectedSavings = MOCK_SAVINGS_PER_DAY * soberDays; // 10 * 10 = 100
      // Expecting failure: calculateSavings is not implemented
      expect(calculateSavings(soberDays)).toBe(expectedSavings);
    });

    // Scenario 2: Calculate Savings with Zero Sober Days
    it('should return 0 savings when there are zero sober days', () => {
      const soberDays = 0;
      const expectedSavings = 0;
      // Expecting failure: calculateSavings is not implemented
      expect(calculateSavings(soberDays)).toBe(expectedSavings);
    });

    it('should return 0 savings for negative sober days (edge case)', () => {
      const soberDays = -5; // Should ideally not happen, but test robustness
      const expectedSavings = 0;
      // Expecting failure: calculateSavings is not implemented
      expect(calculateSavings(soberDays)).toBe(expectedSavings);
    });

    // Scenario 5: MVP Hardcoded Values Usage (Implicitly tested by using constants)
    // This test implicitly assumes the service uses the correct constants internally.
    // A more explicit test might involve mocking/spying if constants were configurable,
    // but for MVP, assuming they are hardcoded is sufficient for this test.
    it('should use the correct MVP constants for calculation', () => {
        const soberDays = 7;
        const expectedSavings = MOCK_SAVINGS_PER_DAY * soberDays; // 10 * 7 = 70
        // Expecting failure: calculateSavings is not implemented
        expect(calculateSavings(soberDays)).toBe(expectedSavings);
    });
  });
});