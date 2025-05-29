import { View } from "react-native";
import { Text } from "./text";
import { cn } from "../../lib/utils";

interface AvatarProps {
	/**
	 * Optional className for additional Tailwind styling
	 */
	className?: string;
	/**
	 * Optional text to display inside the avatar. If not provided, shows a default user icon
	 */
	text?: string;
}

/**
 * Avatar component that displays a circular placeholder with a user icon.
 * Uses Nativewind/Tailwind CSS for styling.
 */
export function Avatar({ className, text }: AvatarProps) {
	return (
		<View
			className={cn(
				"h-10 w-10 rounded-full bg-gray-200 items-center justify-center",
				className,
			)}
		>
			<Text className="text-gray-500 text-sm">{text || "👤"}</Text>
		</View>
	);
}
