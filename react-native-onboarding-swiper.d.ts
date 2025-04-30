/*
FILE: react-native-onboarding-swiper.d.ts
PURPOSE: Provides basic TypeScript type declarations for the 'react-native-onboarding-swiper' library to enable type checking.
DEFINITIONS:
  - Page: Interface for individual onboarding page configuration.
  - DoneButtonProps: Interface for props passed to a custom Done button component.
  - OnboardingProps: Interface for the main Onboarding component's props.
  - Onboarding: React functional component type definition for the library's main export.
DEPENDENCIES: react, react-native
*/

// Basic type declaration for react-native-onboarding-swiper
// This silences the TS error but doesn't provide full type safety.
// Add more specific types as needed.

declare module 'react-native-onboarding-swiper' {
  import * as React from 'react';
  import { StyleProp, ViewStyle, ImageSourcePropType } from 'react-native';

  export interface Page {
    backgroundColor: string;
    image: React.ReactNode | null; // Allow null as per our usage
    title: React.ReactNode | string;
    subtitle: React.ReactNode | string; // Allow ReactNode as per our usage
    // Add other page props if used
  }

  export interface DoneButtonProps {
    isLight: boolean;
    allowFontScaling: boolean;
    onPress: () => void;
    // Add other props passed by the library if needed
  }

  export interface OnboardingProps {
    pages: Page[];
    onDone?: () => void;
    onSkip?: () => void;
    showSkip?: boolean;
    showNext?: boolean;
    showDone?: boolean;
    DoneButtonComponent?: React.ComponentType<DoneButtonProps>;
    // Add other Onboarding props if used (e.g., SkipButtonComponent, NextButtonComponent, containerStyles, etc.)
    [key: string]: any; // Allow other props
  }

  const Onboarding: React.FC<OnboardingProps>;

  export default Onboarding;
}