// FILE: lib/services/financial-service.ts
// PURPOSE: Provides utility functions for financial calculations related to sobriety savings.
// FUNCTIONS:
//   - calculateSavings(soberDays: number) → number: Estimates total savings based on sober days, using hardcoded drink price and daily consumption.
// DEPENDENCIES: None

// lib/services/financial-service.ts

/**
 * Calculates the estimated savings based on the number of sober days.
 * Uses hardcoded values for price per drink and drinks per day.
 *
 * @param soberDays - The number of consecutive sober days.
 * @returns The estimated total savings.
 */
export const calculateSavings = (soberDays: number): number => {
  // Handle negative input as per test requirement
  if (soberDays < 0) {
    return 0;
  }
  const pricePerDrink = 5; // Hardcoded price per drink
  const drinksPerDay = 2; // Hardcoded average drinks per day
  return soberDays * drinksPerDay * pricePerDrink;
};