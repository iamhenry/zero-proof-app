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
import { useRepository } from "./RepositoryContext"; // Add repository context
import { calculateSavings } from "../lib/services/financial-service";
import { WeekData, DayData } from "@/components/ui/calendar/types"; // Import types for clarity

interface SavingsDataContextProps {
	currentSavings: number;
	isLoading: boolean;
	refreshDrinkCost: () => Promise<void>;
}

// Create the context with a default undefined value
export const SavingsDataContext = createContext<
	SavingsDataContextProps | undefined
>(undefined);

// Create the provider component
export const SavingsDataProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	// Consume CalendarDataContext to get the weeks data
	const { weeks } = useCalendarContext(); // Use the correct hook
	const repository = useRepository(); // Get repository instance
	const [currentSavings, setCurrentSavings] = useState(0);
	const [weeklyDrinks, setWeeklyDrinks] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Helper function to calculate total sober days from weeks data
	const getTotalSoberDays = (weeksData: WeekData[]): number => {
		// Flatten the weeks data and count sober days
		const soberDays = weeksData
			.flatMap((week: WeekData) => week.days)
			.filter((day: DayData) => day.sober);

		console.log("[SavingsDataContext:getTotalSoberDays] Found sober days:", {
			total: soberDays.length,
			dates: soberDays.map((day) => day.date),
		});

		return soberDays.length;
	};

	// Add loadDrinkQuantity as a named function to be reused
	const loadDrinkQuantity = async () => {
		try {
			const quantity = await repository.loadDrinkCost();
			console.log("[SavingsDataContext] Loaded drink quantity:", quantity);

			if (quantity === null || quantity === undefined) {
				console.log(
					"[SavingsDataContext] No drink quantity found, using default (0)",
				);
				setWeeklyDrinks(0);
			} else {
				setWeeklyDrinks(quantity);
			}
		} catch (error) {
			console.error(
				"[SavingsDataContext] Error loading drink quantity:",
				error,
			);
			console.log("[SavingsDataContext] Using default value (0) due to error");
			setWeeklyDrinks(0);
		} finally {
			setIsLoading(false);
		}
	};

	// Use loadDrinkQuantity in the initial effect
	useEffect(() => {
		loadDrinkQuantity();
	}, [repository]);

	// Calculate savings whenever weeks data or drink quantity changes
	useEffect(() => {
		const totalSoberDays = getTotalSoberDays(weeks);
		console.log("[SavingsDataContext] Calculating savings:", {
			totalSoberDays,
			weeklyDrinks,
			weeksLength: weeks.length,
			firstWeekDays: weeks[0]?.days.length,
			lastWeekDays: weeks[weeks.length - 1]?.days.length,
		});

		const savings = calculateSavings(totalSoberDays, weeklyDrinks);
		console.log("[SavingsDataContext] New savings calculated:", savings);
		setCurrentSavings(savings);
	}, [weeks, weeklyDrinks]); // Depend on both weeks and weeklyDrinks

	// Provide the calculated savings and loading state to children components
	return (
		<SavingsDataContext.Provider
			value={{
				currentSavings,
				isLoading,
				refreshDrinkCost: loadDrinkQuantity,
			}}
		>
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
