/**
 * Custom hook for managing drink quantity form state and validation
 */

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { drinkQuantitySchema, DrinkQuantityFormData } from "../types";
import { useEffect } from "react";

interface UseDrinkQuantityFormProps {
  onSubmit: (value: number) => void;
  initialValue?: number;
  errorMessage?: string;
}

interface UseDrinkQuantityFormReturn {
  control: UseFormReturn<DrinkQuantityFormData>["control"];
  handleSubmit: UseFormReturn<DrinkQuantityFormData>["handleSubmit"];
  errors: UseFormReturn<DrinkQuantityFormData>["formState"]["errors"];
  isButtonDisabled: boolean;
  handleFormSubmit: (data: DrinkQuantityFormData) => void;
  setValue: UseFormReturn<DrinkQuantityFormData>["setValue"];
  quantityValue: string | undefined;
}

export function useDrinkQuantityForm({
  onSubmit,
  initialValue = 0,
  errorMessage = "Please enter a valid quantity",
}: UseDrinkQuantityFormProps): UseDrinkQuantityFormReturn {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<DrinkQuantityFormData>({
    resolver: zodResolver(drinkQuantitySchema),
    defaultValues: {
      quantity: initialValue > 0 ? initialValue.toString() : "",
    },
    mode: "onChange",
  });

  // Use an effect to update the form value when initialValue changes
  useEffect(() => {
    if (initialValue > 0) {
      setValue("quantity", initialValue.toString(), { shouldValidate: true });
    }
  }, [initialValue, setValue]);

  const quantityValue = watch("quantity");

  const handleFormSubmit = (data: DrinkQuantityFormData) => {
    onSubmit(parseInt(data.quantity, 10));
  };

  const isButtonDisabled =
    !isValid || 
    !quantityValue || 
    quantityValue === "0" || 
    parseInt(quantityValue, 10) <= 0;

  return {
    control,
    handleSubmit,
    errors,
    isButtonDisabled,
    handleFormSubmit,
    setValue,
    quantityValue,
  };
}