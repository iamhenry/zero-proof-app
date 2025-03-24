import { DayData, WeekData, CalendarData } from './types';

// Function to get color based on intensity (1-10)
export const getIntensityColor = (intensity: number): string => {
  // Map intensity (1-10) to a shade of green
  switch (intensity) {
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
    default: return 'bg-gray-100';
  }
};

// Generate 5 months of static data
export const generateStaticCalendarData = (): CalendarData => {
  // Set start date to January 1, 2024
  const startDate = new Date(2024, 0, 1);
  const days: DayData[] = [];
  
  // Generate 5 months of days (approx 150 days)
  for (let i = 0; i < 150; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const day = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // Check if it's the first day of the month
    const isFirstOfMonth = day === 1;
    
    // Generate random intensity value between 1 and 10
    const intensity = Math.floor(Math.random() * 10) + 1;
    
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