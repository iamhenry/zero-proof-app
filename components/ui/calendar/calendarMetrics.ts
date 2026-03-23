/**
 * FILE: components/ui/calendar/calendarMetrics.ts
 * PURPOSE: Single source of truth for week-row layout metrics.
 * CONSUMERS: CalendarGrid (FlatList getItemLayout), CalendarDataContext (scrollToToday).
 *
 * A rendered week row is the DayCell height (60) plus DayCell vertical padding
 * (2 top + 2 bottom from `p-0.5`), plus the row's `mb-1` spacing.
 * If those styles change, update these constants to keep scroll math stable.
 */

export const WEEK_ROW_HEIGHT = 64;
export const WEEK_ROW_MARGIN_BOTTOM = 4;
export const WEEK_ITEM_LENGTH = WEEK_ROW_HEIGHT + WEEK_ROW_MARGIN_BOTTOM;

export const getWeekItemLayout = (_: unknown, index: number) => ({
	length: WEEK_ITEM_LENGTH,
	offset: WEEK_ITEM_LENGTH * index,
	index,
});
