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
  onSubmit: (value: number) => void;
  initialValue?: number;
  placeholder?: string;
  errorMessage?: string;
  label?: string;
}