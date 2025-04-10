// FILE: context/SavingsDataContext.tsx
// PURPOSE: Manages and provides the calculated financial savings based on sober days tracked in CalendarDataContext.
// COMPONENTS:
//   - SavingsDataProvider: Provider component that calculates and distributes savings.
// HOOKS:
//   - useSavingsData() → { currentSavings: number }: Hook to access the current savings value.
// DEPENDENCIES: React, CalendarDataContext, lib/services/financial-service, @/components/ui/calendar/types

// context/SavingsDataContext.tsx
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { useCalendarContext } from "./CalendarDataContext"; // Correct hook import
import { calculateSavings } from "../lib/services/financial-service";
import { WeekData, DayData } from "@/components/ui/calendar/types"; // Import types for clarity

interface SavingsDataContextProps {
	currentSavings: number;
}

// Create the context with a default undefined value
const SavingsDataContext = createContext<SavingsDataContextProps | undefined>(
	undefined,
);

// Create the provider component
export const SavingsDataProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	// Consume CalendarDataContext to get the weeks data
	const { weeks } = useCalendarContext(); // Use the correct hook
	const [currentSavings, setCurrentSavings] = useState(0);

	// Helper function to calculate total sober days from weeks data
	const getTotalSoberDays = (weeksData: WeekData[]): number => {
		return weeksData
			.flatMap((week: WeekData) => week.days)
			.filter((day: DayData) => day.sober).length;
	};

	// Calculate savings whenever the weeks data changes
	useEffect(() => {
		const totalSoberDays = getTotalSoberDays(weeks);
		const savings = calculateSavings(totalSoberDays);
		setCurrentSavings(savings);
	}, [weeks]); // Depend on weeks data

	// Provide the calculated savings to children components
	return (
		<SavingsDataContext.Provider value={{ currentSavings }}>
			{children}
		</SavingsDataContext.Provider>
	);
};

// Custom hook to consume the SavingsDataContext
export const useSavingsData = (): SavingsDataContextProps => {
	const context = useContext(SavingsDataContext);
	if (context === undefined) {
		// Ensure the hook is used within the provider
		throw new Error("useSavingsData must be used within a SavingsDataProvider");
	}
	return context;
};
