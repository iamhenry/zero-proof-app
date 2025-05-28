# Product Requirements Document: Settings Subscription Profile

## Overview

### Feature Name
Settings Subscription Profile

### Feature Description
A comprehensive user profile section in the settings screen that displays the user's avatar (first letter of email), subscription status with visual indicators, email address, and provides direct access to iOS subscription management.

### Business Objectives
- Increase user transparency about their subscription status
- Reduce customer support requests related to subscription management
- Improve user engagement by providing clear subscription value proposition
- Enhance user experience with personalized profile information

### Success Metrics
- Reduction in subscription-related support tickets by 30%
- Increased subscription management engagement by 25%
- User satisfaction score improvement for settings experience
- Reduced churn through better subscription visibility

---

## User Stories & Acceptance Criteria

### Primary User Story
**As a user, I want to see my subscription status and personal information in the settings screen so that I can understand my account status and easily manage my subscription.**

### Related User Stories
- **US-36**: As a user, I want to see my subscription type (weekly, monthly, etc.) in the settings view with a deeplink to the OS settings to manage my subscriptions
  - It should have the email address I used to sign up
  - A deeplink to the iOS subscription settings screen  
  - A green "Pro" badge to indicate the user has subscribed

---

## Functional Requirements

### FR-1: User Avatar Display
- **Requirement**: Display a circular avatar showing the first letter of the user's email address
- **Input**: User email from Supabase authentication context
- **Output**: Circular avatar with uppercase first letter, centered and styled
- **Business Rule**: Avatar must always display, even with loading states or errors
- **Validation**: Handle empty emails, special characters, and non-ASCII characters gracefully

### FR-2: Subscription Status Badge
- **Requirement**: Display a "Pro" badge overlay on avatar for subscribed users
- **Input**: Subscription status from RevenueCat SDK
- **Output**: Green badge positioned at bottom-right of avatar
- **Business Rule**: Badge only appears for users with active entitlements
- **Validation**: Badge must not interfere with avatar readability

### FR-3: Email Address Display
- **Requirement**: Show user's email address below the avatar
- **Input**: User email from Supabase user context
- **Output**: Formatted email text with consistent typography
- **Business Rule**: Email must be displayed exactly as registered
- **Validation**: Handle long emails with appropriate truncation or wrapping

### FR-4: Subscription Management Navigation
- **Requirement**: Provide "Manage Subscription" list item that opens iOS Settings
- **Input**: User tap on list item
- **Output**: Deep link to iOS Settings → Subscriptions page
- **Business Rule**: Must work across all supported iOS versions
- **Validation**: Graceful fallback if iOS Settings cannot be opened

### FR-5: Loading States Management
- **Requirement**: Handle loading states for subscription data gracefully
- **Input**: RevenueCat subscription status requests
- **Output**: Non-intrusive loading indicators
- **Business Rule**: UI must remain functional during loading
- **Validation**: Prevent flickering between states

---

## Technical Requirements

### TR-1: Component Architecture
- **Avatar Component**: Reusable UI component in `components/ui/avatar/`
- **Subscription Hook**: Custom hook for RevenueCat integration
- **Settings Screen**: Updated layout with new profile section
- **Deep Link Utility**: iOS Settings navigation helper

### TR-2: Data Integration
- **Supabase Integration**: User email from authentication context
- **RevenueCat Integration**: Subscription status and entitlements
- **Local State Management**: Loading and error states
- **Real-time Updates**: Subscription status changes

### TR-3: Platform Requirements
- **iOS Version**: iOS 14.0+ (for deep link compatibility)
- **React Native**: Compatible with current RN version (0.76.9)
- **Dependencies**: 
  - react-native-purchases (existing)
  - expo-linking (for deep links)
  - Supabase (existing)

### TR-4: Performance Requirements
- **Load Time**: Profile section loads within 2 seconds
- **Memory Usage**: Minimal impact on app memory footprint
- **Network Efficiency**: Batched subscription status checks
- **Offline Handling**: Graceful degradation without network

---

## Design Requirements

### DR-1: Visual Design
- **Avatar Styling**:
  - Circular shape with 60px diameter
  - Background color matching app theme
  - Letter in white/contrasting color
  - Typography: 24px, semi-bold, centered
  
- **Pro Badge Styling**:
  - Green background (#22C55E - matching app theme)
  - 20px diameter circular badge
  - "Pro" text in white, 10px font
  - Positioned at bottom-right with slight overlap
  
- **Layout Structure**:
  - Avatar centered horizontally
  - Email below avatar with 12px spacing
  - List section below with standard iOS styling
  - Consistent padding and margins

### DR-2: User Experience
- **Loading States**: Subtle shimmer effects for avatar and email
- **Error States**: Graceful fallback with default avatar
- **Accessibility**: VoiceOver support for all elements
- **Animation**: Smooth transitions for Pro badge appearance

### DR-3: Responsive Design
- **Screen Sizes**: Support iPhone SE to iPhone Pro Max
- **Orientation**: Portrait primary, landscape compatible
- **Safe Areas**: Respect iOS safe area insets
- **Dynamic Type**: Support iOS Dynamic Type scaling

---

## Implementation Specifications

### IS-1: File Structure
```
components/ui/avatar/
├── index.ts                    # Export barrel
├── Avatar.tsx                  # Main Avatar component
├── ProBadge.tsx               # Pro badge overlay component
└── __tests__/
    ├── Avatar.test.tsx        # Avatar component tests
    └── ProBadge.test.tsx      # Pro badge tests

hooks/
├── useSubscriptionStatus.ts   # RevenueCat integration hook
└── __tests__/
    └── useSubscriptionStatus.test.ts

utils/
├── deeplink.ts               # iOS Settings deep link utility
└── __tests__/
    └── deeplink.test.ts

app/(app)/(protected)/settings.tsx  # Updated settings screen
```

### IS-2: Component Interfaces
```typescript
// Avatar Component Props
interface AvatarProps {
  email: string;
  size?: number;
  showProBadge?: boolean;
  isLoading?: boolean;
  className?: string;
}

// Subscription Hook Return Type
interface SubscriptionStatus {
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscriptionType?: string;
  renewalDate?: Date;
}

// Settings List Item Type
interface SettingsListItem {
  id: string;
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
}
```

### IS-3: Deep Link Implementation
```typescript
// iOS Settings Deep Link URLs
const IOS_SETTINGS_URLS = {
  SUBSCRIPTIONS: 'App-Prefs:root=SUBSCRIPTIONS',
  GENERAL: 'App-Prefs:root=General',
  FALLBACK: 'App-Prefs:root'
};
```

### IS-4: RevenueCat Integration
- Utilize existing `getCustomerInfo()` function
- Check `customerInfo.entitlements.active` for subscription status
- Handle errors gracefully with fallback states
- Cache subscription status for performance

---

## Dependencies & Integration

### Existing Dependencies
- `react-native-purchases`: Subscription management (existing)
- `@supabase/supabase-js`: User authentication (existing)
- `expo-linking`: Deep link functionality (existing)
- `react-native`: Core framework (existing)

### New Dependencies
- None required - implementation uses existing dependencies

### Integration Points
- **Supabase Context**: `useSupabase()` hook for user email
- **RevenueCat Config**: Existing helper functions in `config/revenuecat.ts`
- **UI Theme**: Existing color scheme and typography
- **Navigation**: Expo Router for settings screen

---

## Testing Strategy

### TS-1: Unit Testing
- Avatar component rendering with different props
- Pro badge display logic based on subscription status
- Subscription status hook with mocked RevenueCat responses
- Deep link utility function testing

### TS-2: Integration Testing
- Settings screen with subscription data integration
- RevenueCat API interaction testing
- Supabase user context integration
- iOS deep link functionality testing

### TS-3: User Acceptance Testing
- Manual testing on physical iOS devices
- Subscription flow testing with test accounts
- Deep link testing across iOS versions
- Accessibility testing with VoiceOver

### TS-4: Error Handling Testing
- Network error scenarios
- RevenueCat API failures
- Missing user data scenarios
- iOS Settings app unavailable

---

## Risk Assessment

### High Risk
- **iOS Deep Link Changes**: Apple may modify deep link URLs in future iOS versions
- **RevenueCat API Reliability**: Third-party service dependency for critical feature
- **User Data Privacy**: Displaying email addresses requires careful handling

### Medium Risk
- **Performance Impact**: Additional API calls may affect settings screen load time
- **UI Consistency**: New components must match existing design system
- **Testing Coverage**: Complex integration requires comprehensive testing

### Low Risk
- **Component Reusability**: Avatar component architecture is straightforward
- **User Experience**: Feature enhances existing functionality without major changes

### Mitigation Strategies
- Implement graceful fallbacks for all API failures
- Add comprehensive error logging for debugging
- Create thorough documentation for deep link maintenance
- Establish monitoring for subscription status check performance

---

## Success Criteria

### Functional Success
- ✅ Avatar displays correctly for all user email formats
- ✅ Pro badge appears/disappears based on subscription status
- ✅ Email address is formatted and displayed properly
- ✅ "Manage Subscription" deep link works on iOS
- ✅ Loading states don't interfere with user experience

### Non-Functional Success
- ✅ Settings screen loads within 2 seconds
- ✅ No crashes or errors in production
- ✅ Accessibility compliance (VoiceOver support)
- ✅ Performance impact < 100ms on settings screen load

### Business Success
- ✅ 30% reduction in subscription-related support tickets
- ✅ 25% increase in subscription management engagement
- ✅ Positive user feedback on settings experience
- ✅ No increase in subscription cancellation rates

---

## Timeline & Milestones

### Phase 1: Component Development (3 days)
- Day 1: Avatar component with Pro badge
- Day 2: Subscription status hook
- Day 3: Deep link utility and testing

### Phase 2: Integration (2 days)
- Day 4: Settings screen integration
- Day 5: UI polish and final testing

### Phase 3: Testing & Launch (2 days)
- Day 6: Comprehensive testing and bug fixes
- Day 7: Production deployment and monitoring

**Total Timeline**: 7 days

---

## Future Enhancements

### Phase 2 Considerations
- Subscription type display (monthly, yearly, etc.)
- Renewal date information
- Subscription history view
- Multiple subscription tier support

### Phase 3 Considerations
- Profile customization options
- Avatar image upload capability
- Subscription usage analytics
- Enhanced subscription management features

---

## Appendix

### A.1: Related Documentation
- [BDD Scenarios: Settings Subscription Profile](_ai/scenarios/bdd-settings-subscription-profile.md)
- [User Stories Documentation](_ai/docs/USER-STORIES.md)
- [RevenueCat Integration Guide](config/revenuecat.ts)

### A.2: Design References
- Existing UI component library patterns
- iOS Human Interface Guidelines for Settings
- App color scheme and typography standards 