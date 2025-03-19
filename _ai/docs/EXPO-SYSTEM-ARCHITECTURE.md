# Expo System Architecture Document

## 1. Overview

### Purpose
This document outlines the system architecture of the Zero Proof application, a mobile app built with Expo and React Native that helps users track their sobriety journey. The application provides features such as sobriety tracking, streak calculations, and financial savings visualization.

### Scope
The architecture covers the entire application stack, from the frontend UI components to the backend integration with Supabase. It details the component structure, data flow, state management, and authentication mechanisms.

### Technology Stack
- **Frontend**: React Native, Expo, TypeScript, NativeWind (TailwindCSS for React Native)
- **State Management**: React Context API, React Hook Form
- **Routing**: Expo Router
- **Backend**: Supabase (Backend as a Service)
- **Storage**: AsyncStorage, SecureStore
- **Form Handling**: React Hook Form with Zod validation

## 2. Architectural Goals and Constraints

### Goals
- **Cross-Platform Compatibility**: Function seamlessly on iOS and Android
- **Offline Functionality**: Core features available without internet connection
- **Responsive UI**: Adapt to different screen sizes and orientations
- **Secure Authentication**: Protect user data and privacy
- **Maintainable Codebase**: Modular design with clear separation of concerns
- **Performance**: Fast local operations with efficient background syncing

### Constraints
- **Mobile Device Limitations**: Battery usage, storage, and processing power
- **Network Connectivity**: Must handle offline scenarios gracefully
- **Expo Ecosystem**: Limited to capabilities provided by Expo SDK
- **Security Requirements**: Secure handling of sensitive personal health data

## 3. System Context Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile Application                      │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │    UI       │    │  Business   │    │  Data Access    │  │
│  │  Components │◄──►│   Logic     │◄──►│     Layer       │  │
│  └─────────────┘    └─────────────┘    └─────────────────┘  │
│         ▲                                       ▲           │
└─────────┼───────────────────────────────────────┼───────────┘
          │                                       │
          ▼                                       ▼
┌─────────────────────┐               ┌─────────────────────┐
│  Local Storage      │               │  Supabase Backend   │
│  (AsyncStorage,     │               │  - Authentication   │
│   SecureStore)      │               │  - Database         │
└─────────────────────┘               └─────────────────────┘
```

## 4. Architectural Layers

### 4.1 Presentation Layer
The presentation layer is responsible for rendering the UI and handling user interactions.

#### Components
- **Screen Components**: Main application screens (Home, Settings, Authentication)
- **UI Components**: Reusable UI elements (Button, Input, Text, Typography)
- **Navigation**: Expo Router for screen navigation and routing

#### Key Files
- `app/_layout.tsx`: Root layout with Supabase provider
- `app/(app)/_layout.tsx`: Main application layout with navigation structure
- `app/(app)/(protected)/_layout.tsx`: Protected routes layout with tab navigation
- `components/ui/`: UI component library

### 4.2 Business Logic Layer
The business logic layer contains the application's core functionality and state management.

#### Components
- **Context Providers**: Manage global state and provide access to services
- **Hooks**: Custom hooks for reusable logic
- **Form Handling**: Form validation and submission logic

#### Key Files
- `context/supabase-provider.tsx`: Authentication and session management
- `lib/useColorScheme.ts`: Theme management

### 4.3 Data Access Layer
The data access layer handles data persistence, retrieval, and synchronization.

#### Components
- **API Clients**: Interface with backend services
- **Storage Services**: Handle local data persistence
- **Synchronization Logic**: Manage data flow between local storage and backend

#### Key Files
- `config/supabase.ts`: Supabase client configuration

## 5. Key Subsystems

### 5.1 Authentication System
Manages user authentication, registration, and session handling.

#### Components
- **Supabase Auth**: Backend authentication service
- **Auth Context**: Provides authentication state and methods
- **Auth Screens**: Sign-in, sign-up, and welcome screens

#### Data Flow
1. User enters credentials in auth screen
2. Credentials sent to Supabase Auth
3. On success, session stored in SecureStore
4. Auth context updated with user information
5. User redirected to protected routes

#### Key Files
- `context/supabase-provider.tsx`: Authentication context and logic
- `app/(app)/sign-in.tsx`: Sign-in screen
- `app/(app)/sign-up.tsx`: Sign-up screen
- `app/(app)/welcome.tsx`: Welcome screen

### 5.2 Navigation System
Handles screen navigation and routing throughout the application.

#### Components
- **Expo Router**: File-based routing system
- **Stack Navigator**: Modal and screen transitions
- **Tab Navigator**: Bottom tab navigation for main app sections

#### Navigation Structure
- Public routes: Welcome, Sign-in, Sign-up
- Protected routes: Home, Settings
- Modal screens: Displayed as overlays

#### Key Files
- `app/_layout.tsx`: Root layout
- `app/(app)/_layout.tsx`: Main app layout with stack navigation
- `app/(app)/(protected)/_layout.tsx`: Protected routes with tab navigation

### 5.3 Form Handling System
Manages form state, validation, and submission.

#### Components
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Form Components**: Reusable form elements

#### Key Files
- `components/ui/form.tsx`: Form components
- `components/ui/input.tsx`: Input component
- `app/(app)/sign-in.tsx` and `app/(app)/sign-up.tsx`: Form implementation examples

## 6. Data Models

### 6.1 User
```typescript
interface User {
  id: string;
  email: string;
  created_at: Date;
}
```

### 6.2 Session
```typescript
interface Session {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}
```

### 6.3 Form Schemas
```typescript
// Sign-up form schema
const signUpFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64)
    .regex(/^(?=.*[a-z])/)
    .regex(/^(?=.*[A-Z])/)
    .regex(/^(?=.*[0-9])/)
    .regex(/^(?=.*[!@#$%^&*])/),
  confirmPassword: z.string().min(8)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Sign-in form schema
const signInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64)
});
```

## 7. External Interfaces

### 7.1 Supabase API
- **Authentication**: User registration, login, session management
- **Database**: CRUD operations for user data and application state
- **Storage**: File storage for user-generated content

### 7.2 Expo Services
- **Secure Store**: Secure storage for sensitive information
- **AsyncStorage**: Local storage for application data
- **Notifications**: Push notifications for reminders and updates

## 8. Deployment Architecture

### 8.1 Development Environment
- **Expo CLI**: Local development server
- **Expo Go**: Testing on physical devices
- **Supabase Local**: Local backend development

### 8.2 Production Environment
- **Expo Application Services (EAS)**: Build and deployment
- **App Stores**: Distribution through Apple App Store and Google Play
- **Supabase Cloud**: Hosted backend services

## 9. Cross-Cutting Concerns

### 9.1 Security
- **Authentication**: Secure user authentication via Supabase
- **Data Encryption**: Sensitive data stored in SecureStore
- **Session Management**: Automatic token refresh and secure session handling

### 9.2 Error Handling
- **Form Validation**: Client-side validation with Zod
- **API Error Handling**: Graceful handling of backend errors
- **Offline Support**: Fallback mechanisms for offline operation

### 9.3 Performance
- **Lazy Loading**: Components and screens loaded on demand
- **Optimized Rendering**: Efficient UI updates
- **Background Processing**: Minimal background operations to preserve battery

### 9.4 Accessibility
- **Screen Reader Support**: Compatible with VoiceOver and TalkBack
- **Color Contrast**: Sufficient contrast for readability
- **Dynamic Text Sizing**: Support for user-defined text sizes

## 10. Future Considerations

### 10.1 Scalability
- **Component Library Expansion**: Additional UI components for new features
- **Backend Scaling**: Handling increased user load and data volume
- **Feature Expansion**: Architecture designed to accommodate new features

### 10.2 Maintenance
- **Code Organization**: Clear structure for easy navigation and updates
- **Documentation**: Comprehensive documentation for onboarding new developers
- **Testing**: Framework for unit, integration, and end-to-end testing

## 11. Conclusion

The Zero Proof application architecture leverages the Expo and React Native ecosystem to create a cross-platform mobile application with a focus on user experience, performance, and maintainability. The modular design with clear separation of concerns allows for easy extension and maintenance as the application evolves.