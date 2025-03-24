import { DayData, WeekData, CalendarData } from './types';

// Function to get color based on intensity (1-10)
export const getIntensityColor = (intensity: number): string => {
  // Map intensity (1-10) to a shade of green
  // Return empty string for intensity 0 (no color/white)
  switch (intensity) {
    case 0: return '';
    case 1: return 'bg-green-50';
    case 2: return 'bg-green-100';
    case 3: return 'bg-green-200';
    case 4: return 'bg-green-300';
    case 5: return 'bg-green-400';
    case 6: return 'bg-green-500';
    case 7: return 'bg-green-600';
    case 8: return 'bg-green-700';
    case 9: return 'bg-green-800';
    case 10: return 'bg-green-900';
    default: return '';
  }
};

// Generate 5 months of static data
export const generateStaticCalendarData = (): CalendarData => {
  // Set start date to January 1, 2024
  const startDate = new Date(2024, 0, 1);
  const days: DayData[] = [];
  
  // Streak management variables
  let inStreak = false;
  let currentStreakLength = 0;
  let maxStreakLength = 0;
  
  // Generate 5 months of days (approx 150 days)
  for (let i = 0; i < 150; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // Check if it's the first day of the month
    const isFirstOfMonth = day === 1;
    
    let intensity = 0; // Default is no intensity (white)
    
    // Randomly determine if this day should start or continue a streak
    if (!inStreak) {
      // 25% chance to start a new streak (increased from 15% to get more streaks)
      if (Math.random() < 0.25) {
        inStreak = true;
        currentStreakLength = 1;
        maxStreakLength = Math.floor(Math.random() * 12) + 3; // Random streak of 3-14 days
        intensity = 1; // Always start with intensity 1
      }
    } else {
      // Continue the streak
      currentStreakLength++;
      // Increase intensity with streak length, capped at 10
      intensity = Math.min(currentStreakLength, 10);
      
      // End streak if we've reached max length
      if (currentStreakLength >= maxStreakLength) {
        inStreak = false;
      }
    }
    
    days.push({
      id: `${year}-${month + 1}-${day}`,
      date: `${year}-${month + 1}-${day}`,
      day,
      month,
      year,
      intensity,
      isFirstOfMonth
    });
  }
  
  // Group days into weeks (7 days per week) aligned to Sunday as the first day of the week
  const weeks: WeekData[] = [];
  
  // Process days in chunks of 7
  for (let i = 0; i < days.length; i += 7) {
    const weekDays = days.slice(i, i + 7);
    
    // If we have less than 7 days in the last week, it's fine for the static demo
    if (weekDays.length > 0) {
      weeks.push({
        id: `week-${Math.floor(i / 7)}`,
        days: weekDays
      });
    }
  }
  
  return { weeks };
};

// Get month name for display
export const getMonthName = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month];
}; 