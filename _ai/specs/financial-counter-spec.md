# Financial Tracking Feature Implementation - Summary

## Overview
We need to implement the savings calculation feature for the Zero Proof sobriety tracking app. This involves creating a real-time financial counter that shows users how much money they've saved by not drinking.

## Requirements

1. Core Functionality:
   - Display savings based on sober days tracked in the app
   - Use formula: `savings = pricePerDrink × drinksPerDay × soberDays`
   - Update calculation in real-time when user toggles sober/not sober days

2. Initial MVP Implementation:
   - Use hardcoded values for `pricePerDrink` and `drinksPerDay`
   - Connect to existing calendar data to get total sober days
   - Display calculated savings in the SavingsCounter component

3. Technical Approach:
   - Create a dedicated financial service for calculation logic
   - Update the SavingsCounter component to use real values
   - Connect to CalendarDataContext to access sober day data
   - Ensure the counter updates when calendar data changes

4. Future Enhancements (not part of initial implementation):
   - Settings UI for users to enter their own drink quantity
   - Potentially allow for different drink types/costs

## File Structure
- New: `lib/services/financial-service.ts` - Service to handle calculations
- Update: `components/ui/statistics/SavingsCounter.tsx` - Display calculated values
- Existing: Uses data from `context/CalendarDataContext.tsx`

## Implementation Notes
- Focus on separation of concerns with the financial service
- Maintain real-time updates when calendar data changes
- Design with future extensibility in mind
- The SavingsCounter already exists but currently shows hardcoded values

This summary covers the immediate implementation needs while noting future enhancements that will be addressed in later iterations.
