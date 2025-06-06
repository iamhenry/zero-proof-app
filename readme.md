# Zero Proof

## Introduction

Zero Proof is a sobriety tracking mobile application built with React Native and Expo. The app helps users track their sobriety journey through beautiful calendar visualization, streak tracking, financial savings calculations, and real-time progress monitoring. Built with modern technologies including Expo Router for navigation, Tailwind CSS for styling, React-Hook-Form for form handling, Zod for schema validation, and TypeScript for type safety.

### Running on iOS

This project uses [Expo](https://expo.dev/) to build and test the iOS app both locally and on physical devices. To run the app on your iOS device, use:

```sh
npx expo run:ios --device
```

> **Note:** The `ios` and `android` folders are not committed to GitHub, as the project is managed entirely through Expo. Native code is not tracked in version control unless the project is ejected.

## Features

- **Calendar Visualization**: Beautiful heatmap-style calendar showing sobriety progress
- **Streak Tracking**: Real-time streak counter with current and best streak metrics
- **Financial Tracking**: Calculate money saved based on personal drink costs
- **Timer Display**: Live timer showing exact time since last drink
- **Onboarding Flow**: Guided setup with drink quantity input and subscription management
- **Offline Support**: Full functionality with local data persistence
- **iOS Optimized**: Native iOS experience with proper subscription integration

## License

This repository is licensed under the MIT License.
