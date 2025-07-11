# Zero Proof App - Claude Context File

==========================
# MANDATORY PROCESS GATE - CHECK BEFORE ANY RESPONSE:
==========================
  1. Before responding, explicitly state "YESSIR" and reframe the user intent
  2. Immediately read and analyze files `/_ai/context-bank/FILEMAP.MD`
  3. Only once per chat session

## Project Overview
Zero Proof is a React Native/Expo sobriety tracking application that helps users monitor their sobriety journey with features like timer tracking, calendar visualization, savings calculation, and subscription management through RevenueCat.

### Mandatory Code Quality Protocol
BEFORE any code generation, creation, or modification:
1. Read `/_ai/context-bank/FILEMAP.MD` to understand existing codebase architecture
3. Display verification: Show "🎯 FILEMAP-CHECKED" to confirm guidelines reviewed
4. Validate feature boundaries: Ensure contracts defined, inputs validated, dependencies explicit
6. Design for separation: Extract concerns before implementation, not after
7. Use prevention checklist: Type safety, error handling, performance, testing
8. When in doubt: Extract logic to focused functions/services from start

Fortress Integrity Heuristics:
- Feature can be tested in isolation
- No hidden dependencies on global state
- Clear separation between UI, logic, and data layers
- All boundaries properly validated and secured

Triggers for Enhanced Review:
- Any function/component creation or modification
- State management changes
- Business logic implementation
- Integration with external services
- Performance-critical code paths

## Critical Development Memories
- CRITICAL: when fixing bugs never request or expose security secrets or api keys or commands!

## Key Technologies
- React Native with Expo (Expo Router for file-based routing)
- TypeScript with strict mode
- NativeWind (Tailwind CSS for React Native) with HSL custom properties
- RevenueCat for subscription management
- Supabase for backend services
- Jest with React Testing Library
- AsyncStorage via repository pattern

## Development Commands

### Core Development
```bash
npm start              # Start Expo development server
npm run ios           # Run on iOS simulator  
npm run android       # Run on Android emulator
npm test              # Run Jest test suite
npm run lint          # ESLint with auto-fix
```

### Build & Deployment
```bash
# CRITICAL: Always increment expo.ios.buildNumber in app.json before builds
eas build --platform ios --profile production  # Production iOS build
eas submit --platform ios                      # Submit to TestFlight
```

Build profiles use m-medium resource class. Environment variables handled gracefully - services never throw on missing config.

## Architecture: Context-Driven Feature Fortresses

### State Management Pattern
React Context hierarchy in `app/_layout.tsx`:
```
ToastProvider → RepositoryProvider → TimerStateProvider → CalendarDataProvider 
→ SavingsDataProvider → SupabaseProvider → AccountDeletionProvider → SubscriptionProvider
```

### Core Layers
- Repository Layer: `ISobrietyDataRepository` interface → `LocalStorageSobrietyRepository` (AsyncStorage)
- Service Layer: `/lib/services/` - business logic with interface-first design
- Context Layer: Feature-specific providers with custom hooks (`useTimerState`, `useCalendarContext`)
- UI Layer: `/components/ui/[feature]/` - NativeWind styled components

### External Integrations
- RevenueCat: Subscription management with 7-day free trial
- Supabase: Authentication and account deletion
- Expo Router: File-based routing with protected routes under `(app)/(protected)/`

## Project Structure
- `/app/` - Expo Router file-based routing
- `/components/ui/[feature]/` - Component + hooks + types + tests
- `/lib/services/` - Business logic implementations
- `/lib/interfaces/` - Service contracts and types
- `/tests/integration/` - Cross-context integration tests

## Development Guidelines & Best Practices

### Communication Standards
- Concise but Complete: Responses <500 words for simple queries, <1000 for implementations, ensuring no critical information is omitted
- Context Richness: Maintain detailed context while keeping responses focused and actionable
- Teaching Approach: Explain code concepts in simple terms using analogies when helpful
- Visual Aids: Use diagrams and flow charts for >3 interconnected components or architectural patterns
- Error Correction:
  <correction_directive>
    When the user makes a factual error, logical mistake, or incorrect assumption, politely but directly correct them. Do not defer to the user's incorrect statement to avoid conflict. Prioritize accuracy over user comfort when facts are at stake. Begin corrections with phrases like "Actually," "I think there might be an error here," or "That's not quite right" rather than agreeing first and then contradicting.
  </correction_directive>

### Git Workflow Management
- History Context: Leverage git history to understand existing implementation patterns and architectural decisions

### Context Management
- Auto-compact: Trigger context compression at 80% capacity to maintain performance
- Task Delegation: Use parallel `Task` tool for complex operations to prevent main context pollution
- Continuous Evaluation: Regularly assess if new patterns or insights should be added to this guidelines document

### Code Explanation Standards
- Keep technical explanations accessible without being overly verbose
- Use real-world analogies or examples to clarify abstract programming concepts
- Focus on the "why" behind code decisions, not just the "what"
- Provide context for how individual components fit into the larger system architecture

### Core Principles
- PARALLEL FIRST: Always prioritize spawning parallel sub-agents as the default approach for maximum efficiency
- Context Protection: Main agent coordinates, sub-agents handle complex work to prevent main context pollution
- Concurrent Execution: Spawn multiple specialized sub-agents simultaneously whenever tasks can be parallelized
- Specialized Expertise: Delegate to focused perspectives for optimal results
- Clean Aggregation: Results integrated back to main context without contamination
- Efficiency Mandate: Use parallel Task method by default - sequential execution only when dependencies require it

## Testing Infrastructure
```bash
npm test                    # Run full Jest test suite
npm test -- --watch        # Watch mode for development
npm test ComponentName      # Run specific test file
```

Patterns:
- Jest with React Testing Library integration
- Comprehensive test utilities in `/lib/test-utils.tsx` with context mocking
- Factory patterns for test data generation
- Integration tests in `/tests/integration/` for cross-context scenarios
- BDD scenarios documented in `/_ai/scenarios/`
- Test files: `Component.test.tsx` (unit) + `Component.integration.test.tsx`

## Component Development Guidelines

### Component Organization Pattern
```
components/ui/[feature]/
├── Component.tsx           # Main component
├── hooks/useFeature.ts     # Custom hooks
├── types.ts               # TypeScript interfaces
├── index.ts               # Barrel exports
└── __tests__/
    ├── Component.test.tsx
    └── Component.integration.test.tsx
```

### Service Pattern
- Interface-first design in `/lib/interfaces/`
- Implementation in `/lib/services/` with dependency injection
- Error handling with Result/Either patterns - NEVER throw on missing config
- Repository pattern: All persistence through `ISobrietyDataRepository`

### Context Pattern
- Provider components with clear separation of concerns
- Custom hooks for consuming context (`useTimerState`, `useCalendarContext`)
- Loading states and error handling built into contexts
- Memoization for performance optimization


## Build & Deployment Workflow

EAS Build Process:
1. MANDATORY: Increment `expo.ios.buildNumber` in `app.json`
2. Build profiles: development, preview, production (all use m-medium resource class)
3. Legacy dependencies: `@testing-library/react-hooks` requires legacy peer deps in `eas.json`

Environment Safety Pattern:
- All services handle missing env vars gracefully - NEVER throw errors
- Supabase client creation with null fallback for missing environment variables
- RevenueCat initialization returns boolean success/failure
- Test locally with missing env vars before EAS builds to ensure graceful degradation