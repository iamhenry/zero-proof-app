import React from "react";
import { View, Text } from "react-native";

type TimerUnit = {
	value: number;
	label: string;
};

type SobrietyTimerProps = {
	status?: string;
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
};

export function SobrietyTimer({
	status = "Sober",
	days = 14,
	hours = 9,
	minutes = 41,
	seconds = 21,
}: SobrietyTimerProps) {
	const timerUnits: TimerUnit[] = [
		{ value: days, label: "d" },
		{ value: hours, label: "h" },
		{ value: minutes, label: "m" },
		{ value: seconds, label: "s" },
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
							<Text className="text-white text-xs font-extrabold">
								{unit.value}
							</Text>
							<Text className="text-neutral-500 text-xs font-extrabold uppercase">
								{unit.label}
							</Text>
						</View>
					))}
				</View>
			</View>
		</View>
	);
}
