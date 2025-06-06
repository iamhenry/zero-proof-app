import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	ActivityIndicator,
	View,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import * as z from "zod";
import { useRouter } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { useToast } from "@/context/toast-provider";

const formSchema = z.object({
	email: z.string().email("Please enter a valid email address."),
	password: z
		.string()
		.min(8, "Please enter at least 8 characters.")
		.max(64, "Please enter fewer than 64 characters."),
});

export default function SignIn() {
	const { signInWithPassword } = useSupabase();
	const router = useRouter();
	const { showToast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			await signInWithPassword(data.email, data.password);

			form.reset();

			// Dismiss the modal - SupabaseProvider will handle navigation to protected routes
			router.back();
		} catch (error: Error | any) {
			console.log(error.message);
			// Show error feedback to user
			showToast(
				"Sign in failed. Please check your credentials.",
				"error",
				5000,
			);
			// Don't dismiss modal on error - keep user on signin screen
		}
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			keyboardVerticalOffset={100}
			style={{ flex: 1 }}
		>
			<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
				<View className="flex-1 gap-4 web:m-4">
					<H1 className="self-start ">Sign In</H1>
					<Form {...form}>
						<View className="gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormInput
										label="Email"
										placeholder="Email"
										autoCapitalize="none"
										autoComplete="email"
										autoCorrect={false}
										keyboardType="email-address"
										{...field}
									/>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormInput
										label="Password"
										placeholder="Password"
										autoCapitalize="none"
										autoCorrect={false}
										secureTextEntry
										{...field}
									/>
								)}
							/>
						</View>
					</Form>
					<Button
						size="default"
						variant="default"
						onPress={form.handleSubmit(onSubmit)}
						disabled={form.formState.isSubmitting}
						className="web:m-4"
					>
						{form.formState.isSubmitting ? (
							<ActivityIndicator size="small" />
						) : (
							<Text>Sign In</Text>
						)}
					</Button>
				</View>
			</SafeAreaView>
		</KeyboardAvoidingView>
	);
}
