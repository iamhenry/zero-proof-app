// FILE: lib/services/financial-service.ts
// PURPOSE: Provides utility functions for financial calculations related to sobriety savings.
// FUNCTIONS:
//   - calculateSavings(soberDays: number) → number: Estimates total savings based on sober days, using hardcoded drink price and daily consumption.
// DEPENDENCIES: None

// lib/services/financial-service.ts

/**
 * Calculates the estimated savings based on the number of sober days and weekly drink quantity.
 * Uses a hardcoded price per drink but accepts weekly drink quantity as input.
 *
 * @param soberDays - The number of consecutive sober days
 * @param weeklyDrinks - The number of drinks typically consumed per week (optional)
 * @returns The estimated total savings
 */
export const calculateSavings = (soberDays: number, weeklyDrinks?: number | null): number => {
  // Handle negative input
  if (soberDays < 0) {
    return 0;
  }

  // Default weekly drinks if not provided or null
  const DEFAULT_WEEKLY_DRINKS = 0; // Changed from 14 to 0 for safety
  const effectiveWeeklyDrinks = weeklyDrinks ?? DEFAULT_WEEKLY_DRINKS;

  // If weekly drinks is 0, return 0 savings
  if (effectiveWeeklyDrinks === 0) {
    return 0;
  }

  const PRICE_PER_DRINK = 5; // Hardcoded price per drink
  
  // Convert weekly drinks to daily average, rounded to 2 decimal places
  const dailyDrinks = Number((effectiveWeeklyDrinks / 7).toFixed(2));
  
  // Calculate total savings, rounded to whole number
  return Math.round(soberDays * dailyDrinks * PRICE_PER_DRINK);
};