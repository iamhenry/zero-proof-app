# Zero Proof

## Overview
Zero Proof is an iOS application designed to support individuals on their journey to reduce or eliminate alcohol consumption. The app provides a data-driven accountability tool that focuses on tracking sobriety streaks, financial savings, and health milestones. Through an intuitive, GitHub-inspired activity graph interface, users can easily visualize their progress and maintain motivation on their sobriety journey.

## Features
- Interactive calendar-style activity graph for visualizing sobriety progress
- Real-time sobriety timer tracking days, hours, and minutes
- Financial savings calculator based on typical drink costs
- Streak tracking with visual feedback (darker colors for longer streaks)
- Customizable drink logging for non-sober days
- Achievement milestones and badges
- Secure account system for data preservation
- Background timer tracking
- Progress sharing capabilities with custom graphics
- Continuous scrollable calendar interface

## System Requirements
- iOS device
- Internet connection for account synchronization
- Expo Go app (for development)

## Dependencies
### Frontend
- React Native - Mobile application framework
- Expo - Development platform and tools
- Expo Router - Navigation solution
- Nativewind - Tailwind CSS for React Native
- React Hook Form - Form handling
- Zod - Schema validation
- react-native-async-storage - Local storage management
- expo-secure-store - Secure data storage
- react-native-reusables - UI component library

### Backend
- Supabase - Backend as a Service platform

### Development Tools
- TypeScript - Programming language
- Expo CLI - Command line interface
- ESLint - Code linting
- Prettier - Code formatting
- Babel - JavaScript compiler

## Architecture
The application follows a client-server architecture:
- Frontend: React Native mobile application built with Expo
- Backend: Supabase for user authentication and data persistence
- Local Storage: Combination of AsyncStorage and SecureStore for offline capabilities

## Core Components
1. Authentication System
   - User account creation and management
   - Secure login functionality

2. Activity Tracking Interface
   - GitHub-style activity graph
   - Interactive calendar tiles
   - Visual streak indicators

3. Progress Monitoring
   - Real-time sobriety timer
   - Streak counting system
   - Financial savings calculator

4. Data Management
   - Local data persistence
   - Cloud synchronization
   - Background processing for timer updates

5. Sharing System
   - Custom graphics generation
   - Progress sharing capabilities
