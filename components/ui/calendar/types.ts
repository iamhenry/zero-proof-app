export interface DayData {
  id: string;
  date: string;
  day: number;
  month: number;
  year: number;
  intensity: number;
  isFirstOfMonth: boolean;
}

export interface WeekData {
  id: string;
  days: DayData[];
}

export interface CalendarData {
  weeks: WeekData[];
} 