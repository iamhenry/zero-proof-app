/**
 * Custom hook for managing drink quantity form state and validation
 */

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { drinkQuantitySchema, DrinkQuantityFormData } from "../types";

interface UseDrinkQuantityFormProps {
  onSubmit: (value: number) => void;
  initialValue: number;
  errorMessage: string;
}

interface UseDrinkQuantityFormReturn {
  control: UseFormReturn<DrinkQuantityFormData>["control"];
  handleSubmit: UseFormReturn<DrinkQuantityFormData>["handleSubmit"];
  errors: UseFormReturn<DrinkQuantityFormData>["formState"]["errors"];
  isButtonDisabled: boolean;
  handleFormSubmit: (data: DrinkQuantityFormData) => void;
  setValue: UseFormReturn<DrinkQuantityFormData>["setValue"];
}

export function useDrinkQuantityForm({
  onSubmit,
  initialValue,
  errorMessage,
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
      quantity: initialValue.toString(),
    },
    mode: "onChange",
  });

  const quantityValue = watch("quantity");

  const handleFormSubmit = (data: DrinkQuantityFormData) => {
    onSubmit(parseInt(data.quantity, 10));
  };

  const isButtonDisabled =
    !isValid || quantityValue === "0" || parseInt(quantityValue, 10) <= 0;

  return {
    control,
    handleSubmit,
    errors,
    isButtonDisabled,
    handleFormSubmit,
    setValue,
  };
}