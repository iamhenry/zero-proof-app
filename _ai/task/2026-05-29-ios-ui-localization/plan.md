# iOS UI Localization Execution Plan

## Goal
Localize Zero Proof's user-facing iOS app UI strings so supported iPhone app languages render localized UI instead of English-only UI. Scope is iOS only, with English fallback and first-pass support for German, Spanish, Japanese, Korean, and Portuguese.

## Confirmed Scope
Platform: iOS only.

Fallback language: English.

Supported runtime locales: `en`, `de`, `es`, `ja`, `ko`, `pt`.

Locale matching rule: convert device locale to its base language first, then fall back to English when unsupported.

Future language rule: add one locale file, one registry entry, one iOS supported locale entry, then fill the same key tree.

Out of scope: Android localization, custom in-app language picker, App Store listing metadata, translating the `Zero Proof` brand name, RevenueCat dashboard-hosted paywall copy, currency behavior changes, and calendar week-start behavior changes.

No automated tests are required for this task per product direction. Keep existing behavior intact and use manual iOS QA for verification.

## Parallel Work Strategy
Foundation work must land first because all other files need the same translation API.

After foundation lands, these workstreams can run in parallel with low conflict risk because they touch separate file groups.

| Workstream | Files | Start After | Conflict Rule |
| --- | --- | --- | --- |
| Foundation | `package.json`, `app.json`, `lib/i18n/*` | Immediately | One owner only |
| Navigation/Auth | `app/(app)/_layout.tsx`, `welcome.tsx`, `sign-in.tsx`, `sign-up.tsx` | Foundation API exists | Do not edit onboarding/settings files |
| Onboarding/Paywall Wrapper | `components/ui/onboarding/*` | Foundation API exists | Do not edit auth files |
| Home/Calendar/Savings | protected layout, timer, calendar, savings files | Foundation API exists | One owner for calendar files |
| Settings/Toasts/Edge Screens | settings, deep link, modal, not-found files | Foundation API exists | Do not change toast provider API unless unavoidable |
| Translation Fill | locale dictionary files only | English dictionary shape exists | Do not edit feature files |

## Current Code Evidence

### Config Has No Localization Dependency
`package.json:13-45`

```json
"dependencies": {
  "@hookform/resolvers": "^3.9.1",
  "@react-native-async-storage/async-storage": "1.23.1",
  "@supabase/supabase-js": "^2.46.1",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "dayjs": "^1.11.13",
  "expo": "~52.0.46",
  "expo-constants": "~17.0.8",
  "expo-image": "~2.0.7",
  "expo-linking": "~7.0.5",
  "expo-router": "~4.0.21",
  "expo-secure-store": "~14.0.1",
  "expo-status-bar": "~2.0.1",
  "expo-system-ui": "~4.0.9",
  "nativewind": "4.1.23",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "react-hook-form": "^7.53.2",
  "react-native": "0.76.9",
  "react-native-gesture-handler": "~2.20.2",
  "react-native-onboarding-swiper": "^1.3.0",
  "react-native-purchases": "^8.10.1",
  "react-native-purchases-ui": "^8.10.1",
  "react-native-reanimated": "~3.16.1",
  "react-native-safe-area-context": "4.12.0",
  "react-native-screens": "~4.4.0",
  "react-native-svg": "15.8.0",
  "react-native-url-polyfill": "^2.0.0",
  "react-native-web": "~0.19.13",
  "tailwind-merge": "^2.5.4",
  "tailwindcss": "^3.4.14",
  "zod": "^3.23.8"
}
```

### App Config Has No Localization Plugin
`app.json:51-54`

```json
"plugins": [
  "expo-router",
  "expo-secure-store"
]
```

## Dependency Compatibility Findings
Use Expo's installer for the native Expo module and pin the plain JS translation package.

Safe install commands:

```sh
npx expo install expo-localization
npm install i18n-js@4.5.3
```

Evidence:

| Package | Finding | Decision |
| --- | --- | --- |
| `expo` | Current app uses `expo@~52.0.46` | Keep SDK 52 unchanged |
| `expo-localization` | Expo SDK 52 bundled modules source lists `expo-localization@~16.0.1`; package peer deps are `expo: *`, `react: *` | Install with `npx expo install expo-localization` |
| `i18n-js` | Latest checked version is `4.5.3`; no React Native or Expo peer dependency blocker found | Install `i18n-js@4.5.3` |

Docs alignment:

- Expo localization guide recommends `expo-localization` for device locale and uses `i18n-js` as the example translation layer.
- Expo CLI docs recommend `npx expo install` for React Native packages that need SDK-compatible versions.
- Current Expo versioned docs for SDK 52 returned 404, so compatibility was verified through npm metadata and Expo SDK 52 bundled modules source instead.
- SDK 52 source evidence: `https://raw.githubusercontent.com/expo/expo/sdk-52/packages/expo/bundledNativeModules.json`.

Risk: low. `expo-localization` is the only native dependency. `i18n-js` is JS-only for this usage.

### Root Layout Is The Stable App-Wide Insertion Point
`app/_layout.tsx:98-114`

```tsx
return (
	<ToastProvider>
		<ServiceInitializer />
		<RepositoryProvider>
			<TimerStateProvider>
				<CalendarDataProvider>
					<SavingsDataProvider>
						<SupabaseProvider>
							<SubscriptionProvider>
								<Slot />
							</SubscriptionProvider>
						</SupabaseProvider>
					</SavingsDataProvider>
				</CalendarDataProvider>
			</TimerStateProvider>
		</RepositoryProvider>
	</ToastProvider>
);
```

## Milestone 1: Foundation
Owner: Foundation workstream.

Implementation tasks:

- [ ] Install SDK-compatible native module: `npx expo install expo-localization`.
- [ ] Install JS translation library: `npm install i18n-js@4.5.3`.
- [ ] Update `app.json` plugin list without removing `expo-router` or `expo-secure-store`.
- [ ] Configure iOS supported locales in the `expo-localization` plugin.
- [ ] Create `lib/i18n/index.ts`.
- [ ] Create `lib/i18n/supportedLocales.ts` as the single locale registry.
- [ ] Create `lib/i18n/locales/en.ts`.
- [ ] Create `lib/i18n/locales/de.ts`.
- [ ] Create `lib/i18n/locales/es.ts`.
- [ ] Create `lib/i18n/locales/ja.ts`.
- [ ] Create `lib/i18n/locales/ko.ts`.
- [ ] Create `lib/i18n/locales/pt.ts`.
- [ ] Export a single `t(key, options?)` helper from `lib/i18n/index.ts`.
- [ ] Export `resolveSupportedLocale()` from `lib/i18n/index.ts` for simple fallback behavior.

Use this target `app.json` plugin shape:

```json
"plugins": [
  "expo-router",
  "expo-secure-store",
  [
    "expo-localization",
    {
      "supportedLocales": {
        "ios": ["en", "de", "es", "ja", "ko", "pt"]
      }
    }
  ]
]
```

Use this translation module shape as the implementation target:

```ts
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

import {
  defaultLocale,
  supportedLocaleTags,
  translations,
  type SupportedLocale,
} from "./supportedLocales";

const getLanguageCode = (locale: string) => locale.split("-")[0];

export const resolveSupportedLocale = (deviceLocale: string | null | undefined): SupportedLocale => {
  const languageCode = deviceLocale ? getLanguageCode(deviceLocale) : defaultLocale;

  return supportedLocaleTags.includes(languageCode as SupportedLocale)
    ? (languageCode as SupportedLocale)
    : defaultLocale;
};

const i18n = new I18n(translations);

i18n.locale = resolveSupportedLocale(getLocales()[0]?.languageTag);
i18n.defaultLocale = defaultLocale;
i18n.enableFallback = true;

export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
```

Use this locale registry shape as the implementation target:

```ts
import en from "./locales/en";
import de from "./locales/de";
import es from "./locales/es";
import ja from "./locales/ja";
import ko from "./locales/ko";
import pt from "./locales/pt";

export const defaultLocale = "en";
export const supportedLocaleTags = ["en", "de", "es", "ja", "ko", "pt"] as const;
export type SupportedLocale = (typeof supportedLocaleTags)[number];

export const translations: Record<SupportedLocale, typeof en> = {
  en,
  de,
  es,
  ja,
  ko,
  pt,
};
```

Completion signal: feature files can import `t` from `@/lib/i18n` and receive English strings before any translations are filled.

## Milestone 2: English Dictionary
Owner: Foundation workstream or translation workstream.

Implementation tasks:

- [ ] Build `lib/i18n/locales/en.ts` from the exact strings listed in Milestones 3 through 7.
- [ ] Use semantic keys like `auth.signIn.title`, not English text as keys.
- [ ] Keep key groups aligned to file areas: `navigation`, `welcome`, `auth`, `onboarding`, `paywall`, `timer`, `calendar`, `savings`, `settings`, `toast`, `notFound`, `modal`.
- [ ] Copy the same key shape into every target locale file before translation fill.
- [ ] Keep brand text as `common.brandName: "Zero Proof"` and reuse it instead of translating it.
- [ ] Preserve interpolation names exactly across locales, for example `{ message }`.
- [ ] Add `calendar.weekdaysShort.*` and `calendar.monthsShort.*` keys so calendar labels use `t()` without extra formatter helpers.

Use this dictionary shape:

```ts
const en = {
  navigation: {
    signUp: "Sign Up",
    signIn: "Sign In",
    modal: "Modal",
    home: "Home",
    settings: "Settings",
  },
  welcome: {
    title: "Welcome to Zero Proof",
    body: "Track your sobriety journey with beautiful calendar visualization and streak tracking!",
    verifyEmailToast: "Check your email to verify your account",
  },
};

export default en;
```

Completion signal: English keys exist before replacing strings in feature files.

Maintainability rule: English is the contract. Every locale must match the English key tree. Missing translated values may ship only if English fallback is intentional and documented in the translation source note.

Regional copy rule: use base-language files until product needs region-specific copy, such as separate `pt-BR` and `pt-PT` wording.

## Milestone 3: Navigation And Auth
Owner: Navigation/Auth workstream.

### Evidence: Stack Header Titles
`app/(app)/_layout.tsx:17-60`

```tsx
<Stack.Screen
	name="sign-up"
	options={{
		presentation: "modal",
		headerShown: true,
		headerTitle: "Sign Up",
```

```tsx
<Stack.Screen
	name="sign-in"
	options={{
		presentation: "modal",
		headerShown: true,
		headerTitle: "Sign In",
```

```tsx
<Stack.Screen
	name="modal"
	options={{
		presentation: "modal",
		headerShown: true,
		headerTitle: "Modal",
```

Implementation tasks:

- [ ] Import `t` in `app/(app)/_layout.tsx`.
- [ ] Replace `headerTitle: "Sign Up"` with `headerTitle: t("navigation.signUp")`.
- [ ] Replace `headerTitle: "Sign In"` with `headerTitle: t("navigation.signIn")`.
- [ ] Replace `headerTitle: "Modal"` with `headerTitle: t("navigation.modal")`.

### Evidence: Welcome Screen
`app/(app)/welcome.tsx:32-73`

```tsx
if (showEmailVerification === "true") {
	showToast("Check your email to verify your account", "info", 5000);
```

```tsx
<H1 className="text-center">Welcome to Zero Proof</H1>
<Muted className="text-center">
	Track your sobriety journey with beautiful calendar visualization and
	streak tracking!
</Muted>
```

```tsx
<Text>Sign Up</Text>
```

```tsx
<Text>Sign In</Text>
```

Implementation tasks:

- [ ] Import `t` in `app/(app)/welcome.tsx`.
- [ ] Replace the email verification toast string with `t("welcome.verifyEmailToast")`.
- [ ] Replace the welcome title with `t("welcome.title")`.
- [ ] Replace the welcome body with `t("welcome.body")`.
- [ ] Replace button labels with `t("navigation.signUp")` and `t("navigation.signIn")`.

### Evidence: Sign In Screen
`app/(app)/sign-in.tsx:20-25`

```tsx
email: z.string().email("Please enter a valid email address."),
password: z
	.string()
	.min(8, "Please enter at least 8 characters.")
	.max(64, "Please enter fewer than 64 characters."),
```

`app/(app)/sign-in.tsx:52-56`

```tsx
showToast(
	"Sign in failed. Please check your credentials.",
	"error",
	5000,
);
```

`app/(app)/sign-in.tsx:69-113`

```tsx
<H1 className="self-start ">Sign In</H1>
```

```tsx
<FormInput
	label="Email"
	placeholder="Email"
```

```tsx
<FormInput
	label="Password"
	placeholder="Password"
```

```tsx
<Text>Sign In</Text>
```

Implementation tasks:

- [ ] Import `t` in `app/(app)/sign-in.tsx`.
- [ ] Replace sign-in title with `t("auth.signIn.title")`.
- [ ] Replace email label and placeholder with `t("auth.email.label")` and `t("auth.email.placeholder")`.
- [ ] Replace password label and placeholder with `t("auth.password.label")` and `t("auth.password.placeholder")`.
- [ ] Replace submit button with `t("auth.signIn.submit")`.
- [ ] Replace sign-in failure toast with `t("auth.signIn.failedToast")`.
- [ ] Replace Zod validation strings with `t("validation.email.invalid")`, `t("validation.password.min")`, and `t("validation.password.max")`.

### Evidence: Sign Up Screen
`app/(app)/sign-up.tsx:20-45`

```tsx
email: z.string().email("Please enter a valid email address."),
password: z
	.string()
	.min(8, "Please enter at least 8 characters.")
	.max(64, "Please enter fewer than 64 characters.")
	.regex(
		/^(?=.*[a-z])/,
		"Your password must have at least one lowercase letter.",
	)
	.regex(
		/^(?=.*[A-Z])/,
		"Your password must have at least one uppercase letter.",
	)
	.regex(/^(?=.*[0-9])/, "Your password must have at least one number.")
	.regex(
		/^(?=.*[!@#$%^&*])/,
		"Your password must have at least one special character.",
	),
confirmPassword: z.string().min(8, "Please enter at least 8 characters."),
})
.refine((data) => data.password === data.confirmPassword, {
	message: "Your passwords do not match.",
```

`app/(app)/sign-up.tsx:72`

```tsx
showToast("Sign up failed. Please try again.", "error", 5000);
```

`app/(app)/sign-up.tsx:85-144`

```tsx
<H1 className="self-start">Sign Up</H1>
```

```tsx
<FormInput
	label="Email"
	placeholder="Email"
```

```tsx
<FormInput
	label="Password"
	placeholder="Password"
```

```tsx
<FormInput
	label="Confirm Password"
	placeholder="Confirm password"
```

```tsx
<Text>Sign Up</Text>
```

Implementation tasks:

- [ ] Import `t` in `app/(app)/sign-up.tsx`.
- [ ] Replace sign-up title with `t("auth.signUp.title")`.
- [ ] Replace email, password, and confirm password labels/placeholders with auth keys.
- [ ] Replace submit button with `t("auth.signUp.submit")`.
- [ ] Replace sign-up failure toast with `t("auth.signUp.failedToast")`.
- [ ] Replace all sign-up Zod validation messages with `validation.*` keys.

Completion signal: navigation, welcome, sign-in, and sign-up screens have no hardcoded user-facing English except approved brand text.

## Milestone 4: Onboarding And Paywall Wrapper
Owner: Onboarding workstream.

### Evidence: Onboarding Slides
`components/ui/onboarding/OnboardingComponent.tsx:43-67`

```tsx
title: "Sobriety Heatmap",
subtitle:
	"The longer your active sober streak, the darker your shades get.",
```

```tsx
title: "Active Streak",
subtitle:
	"Active steak helps you stay motivated on your journey to sobriety",
```

```tsx
title: "Track Savings",
subtitle:
	"Track and calculate your savings based on the days you've been sober.",
```

Implementation tasks:

- [ ] Import `t` in `components/ui/onboarding/OnboardingComponent.tsx`.
- [ ] Replace the heatmap title and subtitle with `t("onboarding.heatmap.title")` and `t("onboarding.heatmap.subtitle")`.
- [ ] Replace the streak title and subtitle with `t("onboarding.streak.title")` and `t("onboarding.streak.subtitle")`.
- [ ] Replace the savings title and subtitle with `t("onboarding.savings.title")` and `t("onboarding.savings.subtitle")`.

Copy note: `Active steak` appears to be a typo in current code. Use corrected English in the dictionary unless product explicitly requests exact current copy.

### Evidence: Drink Quantity Input
`components/ui/onboarding/DrinkQuantityInput.tsx:23-33`

```tsx
placeholder = "0",
errorMessage = "Please enter a valid quantity",
label = "How many drinks per week?",
buttonText = "Next",
```

`components/ui/onboarding/DrinkQuantityInput.tsx:112-131`

```tsx
aria-label="Cancel"
```

```tsx
<Text>Cancel</Text>
```

```tsx
aria-label={buttonText}
```

```tsx
<Text className="text-white">Save</Text>
```

`components/ui/onboarding/types.ts:4-13`

```ts
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
```

`components/ui/onboarding/hooks/useDrinkQuantityForm.ts:26-30`

```ts
export function useDrinkQuantityForm({
  onSubmit,
  initialValue = 0,
  errorMessage = "Please enter a valid quantity",
}: UseDrinkQuantityFormProps): UseDrinkQuantityFormReturn {
```

Implementation tasks:

- [ ] Import `t` where drink quantity defaults are set.
- [ ] Replace `Please enter a valid quantity` with `t("drinkQuantity.error.validQuantity")`.
- [ ] Replace the `useDrinkQuantityForm` default `errorMessage` with `t("drinkQuantity.error.validQuantity")` from the caller or remove the duplicated default if unused.
- [ ] Replace `How many drinks per week?` with `t("drinkQuantity.label")`.
- [ ] Replace `Next` with `t("common.next")`.
- [ ] Replace `Cancel` visible and accessibility strings with `t("common.cancel")`.
- [ ] Replace hardcoded visible `Save` with `{buttonText}` so settings and onboarding can control the localized label.
- [ ] Replace drink quantity Zod messages with `t("drinkQuantity.validation.required")`, `t("drinkQuantity.validation.validNumber")`, and `t("drinkQuantity.validation.greaterThanZero")`.

### Evidence: Paywall Wrapper States
`components/ui/onboarding/PaywallScreen.tsx:51-62`

```tsx
setError(
	"No subscription packages available. Please check RevenueCat dashboard configuration.",
);
```

```tsx
const errorMessage =
	err instanceof Error ? err.message : "Unknown error occurred";
setError(`RevenueCat setup error: ${errorMessage}`);
```

`components/ui/onboarding/PaywallScreen.tsx:77-90`

```tsx
<Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
	Loading subscription options...
</Text>
```

`components/ui/onboarding/PaywallScreen.tsx:116-178`

```tsx
Subscription Unavailable
```

```tsx
setError("Still no subscription packages available.");
```

```tsx
`Retry failed: ${err instanceof Error ? err.message : "Unknown error"}`
```

```tsx
Retry
```

```tsx
Continue Without Subscription
```

`components/ui/onboarding/PaywallScreen.tsx:196-210`

```tsx
No subscription options available at this time.
```

```tsx
Continue
```

`components/ui/onboarding/PaywallScreen.tsx:228-231`

```tsx
<RevenueCatUI.Paywall
	options={{
		displayCloseButton: false, // No close button since onboarding handles navigation
	}}
```

Implementation tasks:

- [ ] Import `t` in `components/ui/onboarding/PaywallScreen.tsx`.
- [ ] Replace loading text with `t("paywall.loading")`.
- [ ] Replace unavailable title with `t("paywall.unavailable.title")`.
- [ ] Replace no-packages/setup/retry error strings with generic localized `paywall.error.*` keys.
- [ ] Keep raw RevenueCat or SDK error details in `console.error`/`console.warn` only, not visible UI.
- [ ] Replace `Retry`, `Continue Without Subscription`, and `Continue` with common/paywall keys.

Boundary note: do not localize `RevenueCatUI.Paywall` internals in app code. Paywall body copy is RevenueCat-managed.

Completion signal: onboarding and paywall wrapper UI strings use translation keys; RevenueCat-hosted paywall remains separately managed.

## Milestone 5: Protected App, Timer, Calendar, Savings
Owner: Home/Calendar/Savings workstream.

### Evidence: Tab Labels
`app/(app)/(protected)/_layout.tsx:107-123`

```tsx
<Tabs.Screen
	name="index"
	options={{
		title: "Home",
```

```tsx
<Tabs.Screen
	name="settings"
	options={{
		title: "Settings",
```

Implementation tasks:

- [ ] Import `t` in `app/(app)/(protected)/_layout.tsx`.
- [ ] Replace `title: "Home"` with `title: t("navigation.home")`.
- [ ] Replace `title: "Settings"` with `title: t("navigation.settings")`.

### Evidence: Timer Copy
`components/ui/timer/SobrietyTimer.tsx:73`

```tsx
export function SobrietyTimer({ status = "Sober" }: SobrietyTimerProps) {
```

`components/ui/timer/SobrietyTimer.tsx:221-225`

```tsx
const timerUnits: TimerUnit[] = [
	{ value: formatUnitValue(shouldShowZeros ? 0 : elapsedDays), label: "d" },
	{ value: formatUnitValue(shouldShowZeros ? 0 : hours), label: "h" },
	{ value: formatUnitValue(shouldShowZeros ? 0 : minutes), label: "m" },
];
```

`components/ui/timer/SobrietyTimer.tsx:291-292`

```tsx
<Text className="text-neutral-500 text-xs font-extrabold uppercase">
	s
</Text>
```

Implementation tasks:

- [ ] Import `t` in `components/ui/timer/SobrietyTimer.tsx`.
- [ ] Replace default `status = "Sober"` with a translated fallback inside the component, for example `const statusLabel = status ?? t("timer.status.sober")` after making `status` optional.

Timer unit note: keep `d`, `h`, `m`, `s` as compact timer unit labels unless product explicitly requests localized unit labels. If requested, replace them with `t("timer.units.daysShort")`, `t("timer.units.hoursShort")`, `t("timer.units.minutesShort")`, and `t("timer.units.secondsShort")`.

### Evidence: Calendar Labels
`components/ui/calendar/WeekdayHeader.tsx:16-18`

```tsx
export function WeekdayHeader() {
	// Define weekday labels (Sunday first)
	const weekdays = ["S", "M", "T", "W", "Th", "F", "S"];
```

`components/ui/calendar/utils.ts:219-223`

```ts
// Get month name for display
export const getMonthName = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month];
};
```

`components/ui/calendar/DayCell.tsx:67-71`

```tsx
const cellContent = useMemo(() => {
	return day.isFirstOfMonth
		? `${getMonthName(day.month)} ${day.day}`
		: day.day;
}, [day.isFirstOfMonth, day.month, day.day]);
```

Implementation tasks:

- [ ] Replace `WeekdayHeader` hardcoded `weekdays` array with ordered `t("calendar.weekdaysShort.*")` values from the dictionaries.
- [ ] Replace `getMonthName(month)` hardcoded month array with ordered `t("calendar.monthsShort.*")` values from the dictionaries.
- [ ] Update `DayCell` dependencies only if the localized month lookup changes its function signature.

Calendar behavior note: preserve Sunday-first ordering intentionally for this task. Locale-specific first weekday behavior is out of scope because it changes calendar behavior, not just text.

### Evidence: Savings Copy And Formatting
`components/ui/statistics/SavingsCounter.tsx:48-49`

```tsx
// Minimal formatting for display
const formattedAmount = currentSavings.toLocaleString();
```

`components/ui/statistics/SavingsCounter.tsx:73-75`

```tsx
<Text className="text-center text-black text-xl font-extrabold font-['Rounded_Mplus_1c']">
	${formattedAmount}
</Text>
```

`components/ui/statistics/SavingsCounter.tsx:93`

```tsx
<Text style={{ color: "#007AFF", fontSize: 17 }}>Close</Text>
```

Implementation tasks:

- [ ] Import `t` in `components/ui/statistics/SavingsCounter.tsx`.
- [ ] Replace `Close` with `t("common.close")`.
- [ ] Keep the existing `$` behavior and simple number formatting for now.

Currency note: currency localization is intentionally out of scope. Keep `$` behavior until the product defines user currency settings or region-based currency behavior.

Completion signal: protected tabs, timer status, calendar labels, and savings modal copy no longer depend on hardcoded English strings.

## Milestone 6: Settings, Toasts, Edge Screens
Owner: Settings/Toasts/Edge workstream.

### Evidence: Settings Screen
`app/(app)/(protected)/settings.tsx:38-65`

```tsx
const subject = "Feedback%20for%20Zero%20Proof";
```

```tsx
title: "Send Feedback",
```

```tsx
title: "Manage Subscription",
```

`app/(app)/(protected)/settings.tsx:87-89`

```tsx
<Avatar className="h-20 w-20" text="ZP" />
<Text className="text-xl">Zero Proof</Text>
<Badge text="Pro" />
```

Implementation tasks:

- [ ] Import `t` in `app/(app)/(protected)/settings.tsx`.
- [ ] Replace feedback subject with `encodeURIComponent(t("settings.feedback.subject"))`.
- [ ] Replace `Send Feedback` with `t("settings.actions.sendFeedback")`.
- [ ] Replace `Manage Subscription` with `t("settings.actions.manageSubscription")`.

Brand note: keep `Zero Proof` unchanged as brand text. Replace `Pro` only if product wants the badge localized.

### Evidence: Settings Drink Quantity Container
`components/ui/settings/SettingsDrinkQuantityContainer.tsx:35-36`

```tsx
`Failed to load drink quantity data: ${error?.message || ""}`,
```

`components/ui/settings/SettingsDrinkQuantityContainer.tsx:62-63`

```tsx
`Failed to save drink quantity. Please try again: ${error?.message || ""}`,
```

`components/ui/settings/SettingsDrinkQuantityContainer.tsx:95-104`

```tsx
label="How many drinks per week?"
buttonText="Save"
```

```tsx
Settings saved successfully!
```

Implementation tasks:

- [ ] Import `t` in `components/ui/settings/SettingsDrinkQuantityContainer.tsx`.
- [ ] Replace load failure text with generic `t("settings.drinkQuantity.loadFailed")`; log raw `error?.message` only.
- [ ] Replace save failure text with generic `t("settings.drinkQuantity.saveFailed")`; log raw `error?.message` only.
- [ ] Replace label with `t("drinkQuantity.label")`.
- [ ] Replace button text with `t("common.save")`.
- [ ] Replace success copy with `t("settings.drinkQuantity.saved")`.

### Evidence: Deep-Link Toasts
`lib/services/DeepLinkService.ts:64-89`

```ts
this.handleVerificationFailure('Invalid verification link');
```

```ts
this.showToast?.('Email verified successfully!', 'success', 5000);
```

```ts
const message = errorMessage || 'Verification failed. Please try again.';
```

Implementation tasks:

- [ ] Import `t` in `lib/services/DeepLinkService.ts`.
- [ ] Replace invalid verification link string with `t("toast.verification.invalidLink")`.
- [ ] Replace success toast with `t("toast.verification.success")`.
- [ ] Replace fallback failure toast with `t("toast.verification.failed")`.

Toast API note: do not change `ToastProvider` API unless TypeScript requires it.

### Evidence: Edge Screens
`app/(app)/+not-found.tsx:8-9`

```tsx
<H1 className="text-center">404</H1>
<Muted className="text-center">This page could not be found.</Muted>
```

`app/(app)/modal.tsx:8-9`

```tsx
<H1 className="text-center">Modal</H1>
<Muted className="text-center">This is a modal screen.</Muted>
```

Implementation tasks:

- [ ] Import `t` in `app/(app)/+not-found.tsx`.
- [ ] Replace not-found message with `t("notFound.message")`.
- [ ] Import `t` in `app/(app)/modal.tsx`.
- [ ] Replace modal title with `t("modal.title")`.
- [ ] Replace modal body with `t("modal.body")`.

Completion signal: settings actions, settings form copy, deep-link toasts, not-found screen, and modal route use translation keys.

## Milestone 7: Translation Fill
Owner: Translation workstream.

Implementation tasks:

- [ ] Fill `lib/i18n/locales/de.ts`.
- [ ] Fill `lib/i18n/locales/es.ts`.
- [ ] Fill `lib/i18n/locales/ja.ts`.
- [ ] Fill `lib/i18n/locales/ko.ts`.
- [ ] Fill `lib/i18n/locales/pt.ts`.
- [ ] Add a plain markdown note in this task folder documenting translation source and whether translations were human-reviewed.

Translation notes: preserve all interpolation variables in every locale. Keep `Zero Proof` unchanged in all locales.

Completion signal: all locale files have the same key tree as English.

## Milestone 8: Manual Verification
Manual verification is required, but it is not an implementation task and therefore is not represented as checkboxes.

Run `npm run lint` to catch syntax/import issues introduced by implementation.

Run the iOS app. For each supported locale, change the iOS app/device language and relaunch: `en`, `de`, `es`, `ja`, `ko`, `pt`.

Verify visible copy on welcome, sign-in, sign-up, onboarding, paywall wrapper states, protected tabs, timer, calendar, savings modal, settings, deep-link toasts where reachable, not-found, and modal route.

Verify long translated strings do not clip on a small iPhone simulator.

Verify RevenueCat-hosted paywall body separately in RevenueCat, because `<RevenueCatUI.Paywall />` renders dashboard-managed content.

## Final Done Criteria
`package.json` includes localization dependencies.

`app.json` declares iOS supported locales without removing existing plugins.

`lib/i18n/` exists with English and target locale dictionaries.

All code snippets listed above have been replaced with translation keys or locale-aware formatting, except approved brand text and externally managed RevenueCat paywall content.

Manual iOS verification passes for all target locales.

RevenueCat dashboard localization follow-up is documented if RevenueCat paywall content remains English.

## References
- Expo localization guide: https://docs.expo.dev/guides/localization/
- Expo localization SDK: https://docs.expo.dev/versions/latest/sdk/localization/
- Apple localization identifiers: https://developer.apple.com/documentation/xcode/choosing-localization-regions-and-scripts
- App Store localizations: https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations/
- RevenueCat paywall localization boundary: https://www.revenuecat.com/docs/tools/paywalls/displaying-paywalls
