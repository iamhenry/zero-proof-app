import * as z from "zod";

// Define the validation schema using Zod
export const drinkQuantitySchema = z.object({
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !Number.isNaN(parseInt(val, 10)), {
      message: "Please enter a valid number",
    })
    .refine((val) => parseInt(val, 10) > 0, {
      message: "Please enter a quantity greater than 0",
    }),
});

export type DrinkQuantityFormData = z.infer<typeof drinkQuantitySchema>;

export interface DrinkQuantityInputProps {
  // Core functionality
  onSubmit: (value: number) => void;
  initialValue?: number;
  
  // Display customization
  placeholder?: string;
  errorMessage?: string;
  label?: string;
  buttonText?: string;  // New: Customizable button text (defaults to "Next")
  
  // Mode control
  isSettingsMode?: boolean;  // New: Controls UI layout and button display
  
  // Optional settings mode callbacks
  onCancel?: () => void;  // New: Only used in settings mode
  isLoading?: boolean;    // New: Indicates loading state
  disabled?: boolean;     // New: Disables all interaction with the component
}