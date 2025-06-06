import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Toast as ToastType, useToast } from "@/context/toast-provider";
import { cn } from "@/lib/utils";

interface ToastComponentProps {
	toast: ToastType;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast }) => {
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const translateAnim = useRef(new Animated.Value(-100)).current;
	const animationTimeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		// Animate in
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 300,
				useNativeDriver: true,
			}),
			Animated.timing(translateAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: true,
			}),
		]).start();

		// Animate out before auto-hide
		if (toast.duration && toast.duration > 0) {
			animationTimeoutRef.current = setTimeout(() => {
				Animated.parallel([
					Animated.timing(fadeAnim, {
						toValue: 0,
						duration: 200,
						useNativeDriver: true,
					}),
					Animated.timing(translateAnim, {
						toValue: -100,
						duration: 200,
						useNativeDriver: true,
					}),
				]).start();
			}, toast.duration - 200);
		}

		// Cleanup function
		return () => {
			if (animationTimeoutRef.current) {
				clearTimeout(animationTimeoutRef.current);
			}
			// Stop any running animations
			fadeAnim.stopAnimation();
			translateAnim.stopAnimation();
		};
	}, [fadeAnim, translateAnim, toast.duration]);

	const getToastStyles = (type: ToastType["type"]) => {
		switch (type) {
			case "success":
				return "bg-green-500";
			case "error":
				return "bg-red-500";
			case "warning":
				return "bg-yellow-500";
			case "info":
			default:
				return "bg-blue-500";
		}
	};

	return (
		<Animated.View
			style={{
				opacity: fadeAnim,
				transform: [{ translateY: translateAnim }],
			}}
			className={cn("mx-4 p-4 rounded-lg mb-2", getToastStyles(toast.type))}
		>
			<Text className="text-white text-center font-medium">
				{toast.message}
			</Text>
		</Animated.View>
	);
};

export const ToastContainer: React.FC = () => {
	const { toasts } = useToast();
	const insets = useSafeAreaInsets();

	if (toasts.length === 0) {
		return null;
	}

	return (
		<View
			style={{
				position: "absolute",
				top: insets.top + 10,
				left: 0,
				right: 0,
				zIndex: 9999,
				pointerEvents: "none",
			}}
		>
			{toasts.map((toast) => (
				<ToastComponent key={toast.id} toast={toast} />
			))}
		</View>
	);
};
