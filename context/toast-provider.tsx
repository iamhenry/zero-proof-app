import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	useEffect,
} from "react";

export interface Toast {
	id: string;
	message: string;
	type: "success" | "error" | "info" | "warning";
	duration?: number;
}

interface ToastContextType {
	toasts: Toast[];
	showToast: (
		message: string,
		type?: Toast["type"],
		duration?: number,
	) => string;
	hideToast: (id: string) => void;
	clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};

interface ToastProviderProps {
	children: React.ReactNode;
}

const MAX_TOASTS = 3;

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

	const hideToast = useCallback((id: string) => {
		// Clear the timeout if it exists
		if (timeoutRefs.current[id]) {
			clearTimeout(timeoutRefs.current[id]);
			delete timeoutRefs.current[id];
		}
		setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
	}, []);

	const showToast = useCallback(
		(
			message: string,
			type: Toast["type"] = "info",
			duration: number = 5000,
		): string => {
			const id =
				Date.now().toString() + Math.random().toString(36).substr(2, 9);
			const newToast: Toast = { id, message, type, duration };

			setToasts((prevToasts) => {
				const newToasts = [...prevToasts, newToast];
				// Keep only the most recent toasts to prevent accumulation
				return newToasts.slice(-MAX_TOASTS);
			});

			// Auto-hide toast after duration with proper cleanup
			if (duration > 0) {
				const timeoutId = setTimeout(() => {
					hideToast(id);
				}, duration);
				timeoutRefs.current[id] = timeoutId;
			}

			return id;
		},
		[hideToast],
	);

	const clearToasts = useCallback(() => {
		// Clear all timeouts
		Object.values(timeoutRefs.current).forEach(clearTimeout);
		timeoutRefs.current = {};
		setToasts([]);
	}, []);

	// Cleanup all timeouts on unmount
	useEffect(() => {
		return () => {
			Object.values(timeoutRefs.current).forEach(clearTimeout);
		};
	}, []);

	const value: ToastContextType = {
		toasts,
		showToast,
		hideToast,
		clearToasts,
	};

	return (
		<ToastContext.Provider value={value}>{children}</ToastContext.Provider>
	);
};
