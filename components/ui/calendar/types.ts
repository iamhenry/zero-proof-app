export interface DayData {
  id: string;
  date: string;
  day: number;
  month: number;
  year: number;
  sober: boolean;
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