/**
 * FILE: components/ui/timer/SobrietyTimer.tsx
 * PURPOSE: Displays an animated sobriety timer (d/h/m/s) using state from TimerStateContext with calendar navigation.
 * FUNCTIONS:
 *   - SobrietyTimer({ status?: string }): JSX.Element -> Renders the animated timer component with customizable status text.
 *   - formatUnitValue(value: number): string -> Formats time unit numbers for display.
 *   - calculateElapsedTime(startTime: number | null): { d, h, m, s } -> Calculates time components from a start timestamp.
 * KEY FEATURES:
 *   - Real-time animated display of elapsed sobriety time
 *   - Smooth digit transitions using React Native Reanimated
 *   - Interactive functionality - tapping the timer scrolls calendar to today, with enhanced debugging
 *   - Integration with TimerStateContext for timer state management
 *   - Integration with CalendarDataContext for scrolling functionality
 *   - Debug logging for state changes and function availability
 *   - Intelligent handling of loading states
 *   - Efficient interval-based updates with proper cleanup
 *   - Reliable calendar navigation even when scrolled far into past dates
 * DEPENDENCIES: react, react-native, react-native-reanimated, @/context/TimerStateContext, @/context/CalendarDataContext
 */

import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native"; // Added TouchableOpacity
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
	Easing,
} from "react-native-reanimated";
// Removed ISobrietyDataRepository and TimerState imports as they are handled by context
// Removed useRepository import

import { useTimerState } from "@/context/TimerStateContext"; // Import timer state context hook

import { useCalendarContext } from "@/context/CalendarDataContext"; // Import calendar context hook
type TimerUnit = {
	value: number | string;
	label: string;
};

type SobrietyTimerProps = {
	status?: string; // Status can still be passed or determined differently
};

// Formats a number to a string with consistent width
const formatUnitValue = (value: number): string => {
	return value.toString();
};

// Calculates elapsed time components
const calculateElapsedTime = (
	startTime: number | null,
): { d: number; h: number; m: number; s: number } => {
	if (startTime === null) {
		return { d: 0, h: 0, m: 0, s: 0 };
	}
	const now = Date.now();
	const diff = Math.max(0, now - startTime); // Ensure non-negative difference

	const totalSeconds = Math.floor(diff / 1000);
	const s = totalSeconds % 60;
	const totalMinutes = Math.floor(totalSeconds / 60);
	const m = totalMinutes % 60;
	const totalHours = Math.floor(totalMinutes / 60);
	const h = totalHours % 24;
	const d = Math.floor(totalHours / 24);

	return { d, h, m, s };
};

export function SobrietyTimer({ status = "Sober" }: SobrietyTimerProps) {
	// Get timer state from context, including elapsedDays
	const {
		startTime,
		isRunning,
		elapsedDays,
		isLoading: isTimerLoading,
	} = useTimerState();

	// Add debug logs for timer state changes
	useEffect(() => {
		console.log(`[SobrietyTimer] Timer state changed: 
			startTime=${startTime ? new Date(startTime).toISOString() : "null"} 
			isRunning=${isRunning} 
			elapsedDays=${elapsedDays}
			isLoading=${isTimerLoading}`);
	}, [startTime, isRunning, elapsedDays, isTimerLoading]);

	const { scrollToToday } = useCalendarContext(); // Get scroll function from calendar context

	// Debug log to check if scrollToToday is available
	useEffect(() => {
		console.log(
			`[SobrietyTimer] scrollToToday function availability check: ${typeof scrollToToday === "function" ? "Available" : "Not Available"}`,
		);
	}, [scrollToToday]);

	// Local state for display values only (days state removed)
	// const [days, setDays] = useState(0); // Removed, using elapsedDays from context
	const [hours, setHours] = useState(0);
	const [minutes, setMinutes] = useState(0);
	const [seconds, setSeconds] = useState(0);
	const prevSecondsRef = useRef("00"); // Initialize properly
	// Removed startTimeRef

	// Animation values for seconds
	const animTens = useSharedValue(1);
	const animOnes = useSharedValue(1);

	// Effect to initialize display when timer state loads from context
	useEffect(() => {
		if (!isTimerLoading) {
			// Only run after context has loaded initial state
			if (isRunning && startTime) {
				const elapsed = calculateElapsedTime(startTime);
				// setDays(elapsed.d); // Removed, using elapsedDays from context
				setHours(elapsed.h);
				setMinutes(elapsed.m);
				setSeconds(elapsed.s);
				prevSecondsRef.current = elapsed.s.toString().padStart(2, "0");
			} else {
				// Reset display if timer is not running or startTime is null
				// setDays(0); // Removed, using elapsedDays from context
				setHours(0);
				setMinutes(0);
				setSeconds(0);
				prevSecondsRef.current = "00";
			}
		}
	}, [startTime, isRunning, isTimerLoading]); // Depend on context state and loading status

	// Removed Effect to keep startTimeRef updated

	// Update timer display every second
	useEffect(() => {
		if (!isRunning || startTime === null || isTimerLoading) {
			// Restored startTime === null check
			// Clear interval if timer should not be running or is loading
			// setDays(0); // Removed, using elapsedDays from context
			setHours(0);
			setMinutes(0);
			setSeconds(0);
			prevSecondsRef.current = "00";
			return; // Exit effect early
		}

		const timer = setInterval(() => {
			// Use startTime from context directly
			const elapsed = calculateElapsedTime(startTime);
			const prevFormattedSecs = prevSecondsRef.current;

			// Update state for display
			setSeconds(elapsed.s);
			setMinutes(elapsed.m);
			setHours(elapsed.h);
			// setDays(elapsed.d); // Removed, using elapsedDays from context

			// Calculate next seconds value for animation
			const nextFormattedSecs = elapsed.s.toString().padStart(2, "0");

			// Animate tens digit
			if (nextFormattedSecs[0] !== prevFormattedSecs[0]) {
				animTens.value = 0;
				animTens.value = withTiming(1, {
					duration: 300,
					easing: Easing.out(Easing.ease),
				});
			}

			// Animate ones digit
			if (nextFormattedSecs[1] !== prevFormattedSecs[1]) {
				animOnes.value = 0;
				animOnes.value = withTiming(1, {
					duration: 300,
					easing: Easing.out(Easing.ease),
				});
			}

			// Update ref for next comparison
			prevSecondsRef.current = nextFormattedSecs;

			// Persistence is now handled by the TimerStateContext provider
		}, 1000);

		return () => {
			clearInterval(timer); // Cleanup interval on unmount or when dependencies change
		};
		// Restore dependency on startTime
	}, [isRunning, startTime, isTimerLoading]);

	// Format seconds for animation display
	const formattedSeconds = seconds.toString().padStart(2, "0");
	const secondsTens = formattedSeconds[0];
	const secondsOnes = formattedSeconds[1];

	// Animation styles
	const animStyleTens = useAnimatedStyle(() => {
		return {
			opacity: interpolate(animTens.value, [0, 0.5, 1], [0, 1, 1]),
			transform: [{ translateY: interpolate(animTens.value, [0, 1], [6, 0]) }],
		};
	});

	const animStyleOnes = useAnimatedStyle(() => {
		return {
			opacity: interpolate(animOnes.value, [0, 0.5, 1], [0, 1, 1]),
			transform: [{ translateY: interpolate(animOnes.value, [0, 1], [6, 0]) }],
		};
	});

	const timerUnits: TimerUnit[] = [
		{ value: formatUnitValue(elapsedDays), label: "d" }, // Use elapsedDays from context
		{ value: formatUnitValue(hours), label: "h" },
		{ value: formatUnitValue(minutes), label: "m" },
	];

	// Handle loading state
	if (isTimerLoading) {
		// Optionally return a loading indicator or null
		return (
			<View className="absolute bottom-8 left-0 right-0 items-center z-10">
				<View className="w-72 px-4 py-3 bg-neutral-800 rounded-full shadow-lg border border-black flex-row justify-center items-center">
					<ActivityIndicator size="small" color="#ffffff" />
				</View>
			</View>
		);
	}

	return (
		// Wrap the entire timer display in a TouchableOpacity
		<TouchableOpacity
			onPress={() => {
				console.log("[SobrietyTimer] Timer tapped, calling scrollToToday");
				scrollToToday();
			}}
			activeOpacity={0.8}
			className="absolute bottom-8 left-0 right-0 items-center z-10"
		>
			<View>
				<View className="w-72 px-4 py-3 bg-neutral-800 rounded-full shadow-lg border border-black flex-row justify-between items-center">
					<Text className="text-white text-xs font-extrabold">{status}</Text>
					<View className="flex-row justify-start items-center gap-2">
						{timerUnits.map((unit, index) => (
							<View
								key={index}
								className="flex-row justify-center items-end gap-0.5"
							>
								<View style={{ minWidth: 12, alignItems: "flex-end" }}>
									<Text className="text-white text-xs font-extrabold">
										{unit.value}
									</Text>
								</View>
								<Text className="text-neutral-500 text-xs font-extrabold uppercase">
									{unit.label}
								</Text>
							</View>
						))}

						{/* Seconds with animation */}
						<View className="flex-row justify-center items-end gap-0.5">
							<View
								style={{
									minWidth: 16,
									flexDirection: "row",
									justifyContent: "flex-end",
									alignItems: "flex-end",
								}}
							>
								<Animated.Text
									style={animStyleTens}
									className="text-white text-xs font-extrabold"
								>
									{secondsTens}
								</Animated.Text>
								<Animated.Text
									style={animStyleOnes}
									className="text-white text-xs font-extrabold"
								>
									{secondsOnes}
								</Animated.Text>
							</View>
							<Text className="text-neutral-500 text-xs font-extrabold uppercase">
								s
							</Text>
						</View>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}
