import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
	Easing,
} from "react-native-reanimated";

type TimerUnit = {
	value: number | string;
	label: string;
};

type SobrietyTimerProps = {
	status?: string;
	initialDays?: number;
	initialHours?: number;
	initialMinutes?: number;
	initialSeconds?: number;
};

// Formats a number to a string with consistent width
const formatUnitValue = (value: number): string => {
	return value.toString();
};

export function SobrietyTimer({
	status = "Sober",
	initialDays = 14,
	initialHours = 9,
	initialMinutes = 41,
	initialSeconds = 0,
}: SobrietyTimerProps) {
	const [days, setDays] = useState(initialDays);
	const [hours, setHours] = useState(initialHours);
	const [minutes, setMinutes] = useState(initialMinutes);
	const [seconds, setSeconds] = useState(initialSeconds);
	const prevSecondsRef = useRef(initialSeconds.toString().padStart(2, "0"));

	// Animation values for seconds
	const animTens = useSharedValue(1);
	const animOnes = useSharedValue(1);

	// Format seconds to always be double digits
	const formattedSeconds = seconds.toString().padStart(2, "0");
	const secondsTens = formattedSeconds[0];
	const secondsOnes = formattedSeconds[1];

	// Update timer every second
	useEffect(() => {
		const timer = setInterval(() => {
			const prevFormattedSecs = prevSecondsRef.current;

			// Update timer
			if (seconds === 59) {
				setSeconds(0);
				if (minutes === 59) {
					setMinutes(0);
					if (hours === 23) {
						setHours(0);
						setDays((prev) => prev + 1);
					} else {
						setHours((prev) => prev + 1);
					}
				} else {
					setMinutes((prev) => prev + 1);
				}
			} else {
				setSeconds((prev) => prev + 1);
			}

			// Calculate next seconds value for animation
			const nextSecs = (seconds + 1) % 60;
			const nextFormattedSecs = nextSecs.toString().padStart(2, "0");

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
		}, 1000);

		return () => clearInterval(timer);
	}, [seconds, minutes, hours, days]);

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
		{ value: formatUnitValue(days), label: "d" },
		{ value: formatUnitValue(hours), label: "h" },
		{ value: formatUnitValue(minutes), label: "m" },
	];

	return (
		<View className="absolute bottom-8 left-0 right-0 items-center z-10">
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
	);
}
