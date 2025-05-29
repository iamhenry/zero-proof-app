import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

interface BadgeProps {
	className?: string;
	/**
	 * Text to display inside the badge
	 */
	text?: string;
}

/**
 * A simple badge component that displays "Pro" text with a green background.
 * Can be customized with additional className props.
 */
export function Badge({ className, text = "Pro" }: BadgeProps) {
	return (
		<View className={cn("bg-green-500 px-2 py-0.5 rounded-full", className)}>
			<Text className="text-xs font-medium text-white">{text}</Text>
		</View>
	);
}
