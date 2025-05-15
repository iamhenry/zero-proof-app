# Drink Quantity Input Implementation Specification

# Files

## docs
`_ai/scenarios/bdd-drink-quantity-settings-container.md`
`_ai/scenarios/bdd-drink-quantity-input.md`
`_ai/scenarios/bdd-drink-quantity-onboarding-container.md`

## tests
`components/ui/settings/__tests__/DrinkCostForm.persistence.test.ts`
`components/ui/onboarding/__tests__/DrinkQuantityInput.test.tsx`

# implementation
`components/ui/onboarding/DrinkQuantityInput.tsx`
`components/ui/onboarding/hooks/useDrinkQuantityForm.ts`
`components/ui/settings/hooks/useFinancialSettings.ts`


## 1. Overview & Purpose

This specification outlines the approach for implementing a reusable DrinkQuantityInput component that can be used in both the onboarding flow and settings screens. The goal is to create a component that:

1. Collects and validates user input for drink quantity during onboarding
2. Allows users to edit their drink quantity in settings
3. Persists the data to local storage
4. Updates savings calculations throughout the app when changed
5. Provides appropriate UI feedback and navigation in each context

This implementation follows the container pattern to maintain separation of concerns between presentation logic and business/data logic.

## 2. Core Components

### 2.1 Enhanced DrinkQuantityInput Component

The existing DrinkQuantityInput component will be enhanced to support both onboarding and settings contexts by updating its props interface:

The component will:
- Use React Hook Form with Zod validation
- Display appropriate validation errors
- Render different button configurations based on context
- Maintain accessibility features in both modes

### 2.2 OnboardingDrinkQuantityContainer

Container component for use in the onboarding flow:

```typescript
interface OnboardingDrinkQuantityContainerProps {
  onboardingRef: React.RefObject<Onboarding>; // Reference to onboarding swiper
}
```

The container will:
- Accept no initial value (first-time setup)
- Save submitted values to repository (reusing patterns from useFinancialSettings)
- Use onboardingRef to navigate to next screen on successful submission
- Handle error states during saving
- Not display a Cancel button
- Include proper error feedback if saving fails

### 2.3 SettingsDrinkQuantityContainer

Container component for use in the settings screen:

```typescript
interface SettingsDrinkQuantityContainerProps {
  onSuccess?: () => void;  // Optional callback for successful save
  onCancel?: () => void;   // Optional callback for cancel
}
```

The container will:
- Load existing value from repository
- Save submitted values to repository
- Show success feedback (toast, confirmation, etc.)
- Support cancellation that returns to previous screen
- Handle loading states appropriately

## 3. Implementation Requirements

### Mapping BDD Scenarios to Implementation

#### Onboarding Scenarios (from bdd-drink-quantity-input.md)

| Scenario | Implementation Details |
|----------|------------------------|
| Initial state | OnboardingDrinkQuantityContainer initializes with no saved value, passes default value of 0 to DrinkQuantityInput |
| Entering valid integer | DrinkQuantityInput handles validation and enables Next button when valid |
| Entering zero | DrinkQuantityInput validation logic disables Next button when zero/empty |
| Attempting negative | DrinkQuantityInput validation schema prevents negative values |
| Submitting valid | DrinkQuantityInput validates and submits to container |
| Attempting invalid submit | DrinkQuantityInput prevents submission of invalid/empty data |
| Persisting during onboarding | OnboardingDrinkQuantityContainer saves quantity to repository using existing repository patterns |
| Error handling | OnboardingDrinkQuantityContainer handles errors during save operations and prevents navigation if saving fails |

#### Settings Scenarios (from bdd-drink-quantity-settings.md)

| Scenario | Implementation Details |
|----------|------------------------|
| Initial state in settings | SettingsDrinkQuantityContainer loads value from repository using useFinancialSettings(), passes to DrinkQuantityInput, configures Save/Cancel buttons |
| Entering valid in settings | DrinkQuantityInput handles validation and enables Save button when valid |
| Saving value | SettingsDrinkQuantityContainer saves value via useFinancialSettings().saveSettings() and shows confirmation |
| Canceling changes | SettingsDrinkQuantityContainer handles cancel navigation without saving |
| Loading existing data | SettingsDrinkQuantityContainer manages loading state and displays existing data |
| Real-time calculation update | Repository updates trigger context updates that feed into SavingsCounter |

## 4. Data Flow Diagrams

### Onboarding Flow
```
User Input → DrinkQuantityInput → OnboardingDrinkQuantityContainer → Repository.saveDrinkCost()
                                   ↓
                               Onboarding.goNext() → Next Onboarding Screen
```

### Settings Flow
```
Repository.loadDrinkCost() → SettingsDrinkQuantityContainer → DrinkQuantityInput → User Input
                                        ↑                             ↓
                                        └─────── onSubmit() ──────────┘
                                        ↓
                               Repository.saveDrinkCost() → SavingsDataContext → SavingsCounter Update
```

## 5. Key Interfaces

### Existing Interfaces

```typescript
// Already defined in components/ui/onboarding/types.ts
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

// Current DrinkQuantityInputProps (to be enhanced)
export interface DrinkQuantityInputProps {
  onSubmit: (value: number) => void;
  initialValue?: number;
  placeholder?: string;
  errorMessage?: string;
  label?: string;
}
```

### Updated Interface

The existing DrinkQuantityInputProps interface will be updated rather than creating a new interface:

```typescript
// Updated existing interface with new optional props
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
}
```

## 6. Edge Cases & Error Handling

### Loading States
- Display loading indicator when fetching existing values
- Disable input during save operations
- Prevent multiple simultaneous submissions

### Error Scenarios
- Handle repository save failures with appropriate error messages
- Recover gracefully from load failures (use defaults)
- Support retry mechanisms for failed operations

### Input Validation Edge Cases
- Extremely large numbers (set reasonable upper limits)
- Non-numeric input (prevent via input constraints)
- Zero or negative values (handled by validation schema)

## 7. Migration Plan

### Updating Existing Onboarding Flow
1. Enhance DrinkQuantityInput component with new props
2. Create OnboardingDrinkQuantityContainer
3. Update OnboardingComponent to use the container instead of direct component
4. Implement repository save on submission

### Creating Settings Integration
1. Create SettingsDrinkQuantityContainer
2. Develop SettingsScreen component that uses the container
3. Add navigation to settings from appropriate location in app

### Updating SavingsCounter
1. Modify financial-service.ts to use repository values
2. Update SavingsDataContext to observe repository changes
3. Ensure SavingsCounter updates when calculation changes

## 8. Testing Approach

### Test File Structure

The testing strategy preserves existing tests while adding new tests for enhanced functionality, with an emphasis on code reuse:

1. Existing Test Files (Preserved)
   - `components/ui/onboarding/__tests__/DrinkQuantityInput.test.tsx`: Tests the core form functionality (keep unchanged)
   - `components/ui/settings/__tests__/DrinkCostForm.persistence.test.ts`: Tests repository interaction (leverage patterns)

2. New Test Files (To Be Created)
   - `components/ui/onboarding/__tests__/DrinkQuantityInput.enhanced.test.tsx`: Tests the enhanced component props
   - `components/ui/onboarding/__tests__/OnboardingDrinkQuantityContainer.test.tsx`: Tests onboarding container
   - `components/ui/settings/__tests__/SettingsDrinkQuantityContainer.test.tsx`: Tests settings container
   - `components/ui/settings/__tests__/FinancialSettingsScreen.test.tsx`: Tests settings screen integration

3. Shared Test Utilities (To Be Created)
   - `lib/test-utils/repository-test-utils.ts`: Extract shared repository mocking patterns
   - `lib/test-utils/form-test-utils.ts`: Reusable utilities for testing form components

### Component Testing Strategy

1. Core Component Tests (existing) 
   - Maintains tests for form validation, input handling, submission logic
   - Ensures we don't break existing functionality during enhancement

2. Enhanced Component Tests (new) 
   - Tests new props (buttonText, isSettingsMode)
   - Tests conditional rendering based on mode
   - Tests cancel functionality when in settings mode

3. Container Tests (new)
   - Tests data loading from repository (reuse patterns from DrinkCostForm.persistence.test.ts)
   - Tests saving to repository (reuse mock implementations)
   - Tests navigation callbacks
   - Tests error handling with proper user feedback
   - Tests that navigation only occurs on successful save

### Integration Testing

- Test OnboardingDrinkQuantityContainer with actual repository in test environment
- Test SettingsDrinkQuantityContainer with actual repository in test environment
- Verify SavingsCounter updates when settings change

### Key Test Cases by File

DrinkQuantityInput.enhanced.test.tsx
- Renders with "Save" button text when provided
- Renders with Cancel button in settings mode
- Cancel callback is called when Cancel button is pressed

OnboardingDrinkQuantityContainer.test.tsx
- Initializes with default value
- Saves quantity to repository on submission (using repository testing patterns from DrinkCostForm.persistence.test.ts)
- Calls navigation function after successful save
- Displays error message if save fails
- Does not navigate if save fails
- Reuses repository mock implementation

SettingsDrinkQuantityContainer.test.tsx
- Loads existing value from repository
- Shows loading state while data is fetched
- Provides success feedback on save
- Navigates back on cancel
- Navigates back on success save
- Updates repository with new value

FinancialSettingsScreen.test.tsx
- Full integration test for settings screen
- Tests navigation flow and state management

## 9. Implementation Checklist

### Phase 1: Component Enhancement
- [ ] Update existing DrinkQuantityInput props interface with new optional props
- [ ] Implement conditional rendering based on isSettingsMode
- [ ] Add support for custom button text (default to "Next")
- [ ] Add cancel button rendering when in settings mode

### Phase 2: Extract Reusable Test Utilities
- [ ] Create repository-test-utils.ts with common mock patterns
- [ ] Extract createMockRepository utility from DrinkCostForm.persistence.test.ts
- [ ] Create reusable test assertion helpers

### Phase 3: Onboarding Container
- [ ] Create OnboardingDrinkQuantityContainer
- [ ] Reuse repository interaction patterns from useFinancialSettings
- [ ] Implement error handling for save operations
- [ ] Connect to onboarding navigation (only on successful save)
- [ ] Update OnboardingComponent to use container

### Phase 4: Settings Container & Screen
- [ ] Create SettingsDrinkQuantityContainer
- [ ] Implement loading from repository (reuse patterns from useFinancialSettings)
- [ ] Handle success/error states
- [ ] Implement cancel functionality
- [ ] Create SettingsScreen that uses container

### Phase 5: Financial Service Integration
- [ ] Update financial-service.ts to use repository values
- [ ] Modify SavingsDataContext to react to repository changes
- [ ] Test end-to-end calculation updates

### Phase 6: Testing & Validation
- [ ] Create DrinkQuantityInput.enhanced.test.tsx for enhanced component features
- [ ] Create OnboardingDrinkQuantityContainer.test.tsx using shared test utilities
- [ ] Create SettingsDrinkQuantityContainer.test.tsx using shared test utilities
- [ ] Create FinancialSettingsScreen.test.tsx for full screen integration
- [ ] Verify all BDD scenario acceptance criteria (including new persistence scenarios)
- [ ] Test across different devices and screen sizes
- [ ] Validate accessibility features still function

## 10. BDD Files Structure

To maintain a clear separation of concerns, we'll organize our BDD files as follows:

### 1. bdd-drink-quantity-input.md
- Scope: Tests the core DrinkQuantityInput component in isolation
- Focus: Form validation, input handling, UI behavior
- Examples: Initial state, input validation, button enabling/disabling
- Testing: Using DrinkQuantityInput.test.tsx

### 2. bdd-drink-quantity-onboarding.md
- Scope: Tests the OnboardingDrinkQuantityContainer that wraps the core component 
- Focus: Integration with onboarding flow, persistence, navigation
- Examples: Saving data to repository, advancing to next screen, error handling
- Testing: Using OnboardingDrinkQuantityContainer.test.tsx

### 3. bdd-drink-quantity-settings.md
- Scope: Tests the SettingsDrinkQuantityContainer and settings screen integration
- Focus: Loading existing data, editing, cancellation, settings-specific UI
- Examples: Loading saved values, cancel functionality, settings navigation
- Testing: Using SettingsDrinkQuantityContainer.test.tsx
