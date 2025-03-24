import { DayData, WeekData, CalendarData } from './types';

// Function to get color based on intensity (0-10)
// Intensity 0 means not sober (white background)
// Intensity 1-10 represents the streak length, with higher values for longer streaks
export const getIntensityColor = (intensity: number): string => {
  // Map intensity to a shade of green
  switch (intensity) {
    case 0: return ''; // Not sober - will be white
    case 1: return 'bg-green-100'; // First day of streak
    case 2: return 'bg-emerald-100'; // 2 days
    case 3: return 'bg-emerald-200'; // 3 days
    case 4: return 'bg-green-600'; // 4 days
    case 5: return 'bg-green-600'; // 5 days
    case 6: return 'bg-green-700'; // 6 days
    case 7: return 'bg-green-700'; // 7 days
    case 8: return 'bg-green-800'; // 8 days
    case 9: return 'bg-green-900'; // 9 days
    case 10: return 'bg-green-950'; // 10+ days (max intensity)
    default: return ''; // Fallback
  }
};

// Get text color based on intensity
export const getTextColorClass = (intensity: number): string => {
  // For higher intensities (darker backgrounds), use light text
  if (intensity >= 4) {
    return 'text-green-100';
  }
  // For lower intensities (lighter backgrounds), use dark text
  else if (intensity >= 1) {
    return 'text-green-600';
  }
  // For non-sober days, use different text colors based on status
  return 'text-stone-300'; // Default for past days
};

// Determine if a day is today, past, or future
export const getDayStatus = (date: string): 'today' | 'past' | 'future' => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayDate = new Date(date);
  dayDate.setHours(0, 0, 0, 0);
  
  if (dayDate.getTime() === today.getTime()) {
    return 'today';
  } else if (dayDate < today) {
    return 'past';
  } else {
    return 'future';
  }
};

// Get text color based on day status (for non-sober days)
export const getStatusTextColor = (status: 'today' | 'past' | 'future'): string => {
  switch (status) {
    case 'today':
      return 'text-sky-500';
    case 'past':
      return 'text-stone-300';
    case 'future':
      return 'text-neutral-700';
    default:
      return 'text-stone-300';
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
    let sober = false; // Default is not sober
    
    // Randomly determine if this day should start or continue a streak
    if (!inStreak) {
      // 25% chance to start a new streak (increased from 15% to get more streaks)
      if (Math.random() < 0.25) {
        inStreak = true;
        currentStreakLength = 1;
        maxStreakLength = Math.floor(Math.random() * 12) + 3; // Random streak of 3-14 days
        intensity = 1; // Always start with intensity 1
        sober = true; // Mark as sober
      }
    } else {
      // Continue the streak
      currentStreakLength++;
      // Increase intensity with streak length, capped at 10
      intensity = Math.min(currentStreakLength, 10);
      
      sober = true; // Mark as sober
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
      sober,
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