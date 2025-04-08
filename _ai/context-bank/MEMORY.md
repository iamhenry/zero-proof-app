# MEMORY.md

## [Apr 8, 2025 11:37 AM] Component Integration Enhances User Experience
**Context:** Implemented scroll to today functionality in the calendar and integrated it with the SobrietyTimer component.
**Lesson:**
- Creating connections between related UI components (timer and calendar) improves overall user experience by establishing natural interaction patterns.
- Exposing component references (like FlatList refs) through context allows for external control without compromising component encapsulation.
- Touch interactions on informational components (like tapping a timer) can provide intuitive navigation shortcuts without cluttering the UI with additional buttons.
- Tests for user interactions should verify both the technical implementation and the user-facing behavior to ensure reliable functionality.
**Related Methods/Concepts:**
- React Context API for shared state and functionality
- React's useRef and RefObject for component references
- TouchableOpacity for interaction handling
- FlatList scrollToIndex for programmatic scrolling
- Integration testing for component interactions
**Future Improvements:**
- Consider adding visual feedback (animation, haptic feedback) when timer is tapped to reinforce the interaction.
- Implement additional gesture-based interactions that follow this pattern of intuitive connections between related components.
- Add accessibility features to ensure interactions are discoverable by all users.

## [Apr 4, 2025 12:10 PM] Context-Based State Management Improves Reliability and Reduces Duplication
**Context:** Refactored calendar and streak tracking to use a centralized CalendarDataContext instead of isolated component state or hooks.
**Lesson:**
- Using a shared context for related data (calendar state, weeks, streaks) creates a single source of truth that prevents inconsistencies between components.
- Moving calculation logic from hooks into a context provider simplifies component logic and reduces duplication of state updates.
- Exposing derived values (currentStreak, longestStreak) through context avoids redundant calculations in multiple components.
- Pairing context-based state management with proper persistence (via repository pattern) ensures data consistency between app sessions.
- BDD scenarios help define and validate the expected behavior of components that depend on shared state.
**Related Methods/Concepts:**
- React Context API
- Context Providers and Consumers
- Repository Pattern
- Derived State
- Separation of Concerns
- Behavior-Driven Development (BDD)
- Unit Testing (React Testing Library)
**Future Improvements:**
- Consider implementing context selectors to optimize renders when only specific parts of context are used.
- Add more comprehensive integration tests to verify coordination between multiple contexts (e.g., TimerStateContext and CalendarDataContext).
- Explore state management libraries (Redux, Zustand) if context complexity increases.

## [Apr 1, 2025 02:33 PM] TDD & Test Refactoring Learnings
**Context:** Reflecting on challenges encountered when refactoring tests after introducing shared state management (React Context) for repositories and timer state.
**Lesson:**
- Introducing shared state/dependency management (e.g., React Context) often necessitates refactoring test setups, even if the core behavior being tested hasn't changed.
- Tests need to provide the necessary environment (e.g., wrapping with Context Providers using mock values) for the component/hook under test to function correctly.
- Changes in how components interact (e.g., calling a context function vs. a direct repository method) require updating test mocks and assertions to match the new interaction patterns.
- While aiming for behavior-focused tests, the test setup must accurately reflect how the unit under test interacts with its boundaries and dependencies.
- Consider anticipating architectural needs (like Context) during the Red phase to make tests potentially more resilient, though this requires balancing foresight with YAGNI.
- Complement unit tests with integration tests for broader validation less sensitive to internal refactoring.
- Refactor tests promptly after the Green phase (or during refactoring) to keep them relevant, trustworthy, and maintainable.
**Related Methods/Concepts:**
- Test-Driven Development (TDD)
- React Context API
- Mocking (Jest Mocks, Spies)
- Unit Testing (`@testing-library/react`, `@testing-library/react-hooks`)
- Integration Testing
- Test Setup/Environment
- Dependency Injection (via Context)
- Refactoring Tests
**Future Improvements:**
- Develop standardized test setup helpers/wrappers for common Context configurations.
- Explore strategies for mocking context values more efficiently.
- Ensure BDD scenarios adequately cover interactions involving context.

## [Mar 31, 2025 02:51 PM] Standardizing Documentation Improves Knowledge Transfer
**Context:** Refactored documentation format across the codebase to standardize comment structure and improve clarity.
**Lesson:**
- Using "PURPOSE" rather than "DESCRIPTION" in documentation comments directs focus toward component/function role rather than just its behavior.
- Including return types directly in function descriptions (e.g., `functionName() → ReturnType`) creates clearer mental models for developers.
- Removing unnecessary line breaks in documentation comments improves readability.
- Small documentation improvements compound to greatly enhance project maintainability.
**Related Methods/Concepts:**
- Documentation standards
- Code commenting best practices
- Developer experience (DX)
- Knowledge transfer
- Type annotations
**Future Improvements:**
- Consider automated documentation formatting checks in the CI pipeline.
- Add a documentation style guide to the project README.

## [Mar 31, 2025 02:48 PM] Deterministic Data Generation Enables Reliable Testing
**Context:** Refactored `loadMoreWeeks` to use deterministic rules instead of random generation for sobriety status and fixed calendar data loading in `useCalendarData`.
**Lesson:**
- Using deterministic data generation (based on date patterns rather than `Math.random()`) creates predictable test scenarios and fixes data inconsistencies.
- Setting consistent default values (non-sober status, zero intensity) for new calendar days establishes a reliable baseline for streak calculation.
- Properly implementing async loading patterns with setTimeout(0) and loading state flags improves UI responsiveness during potentially blocking operations.
- Protecting against unwanted actions (like toggling future dates) should happen at the data management layer, not just in the UI.
**Related Methods/Concepts:**
- Deterministic data generation
- Test predictability
- Asynchronous operations
- Loading state management
- Event loop and setTimeout
- UX during data loading
**Future Improvements:**
- Replace setTimeout with proper async/await when loading becomes truly asynchronous (API/storage).
- Consider adding loading indicators in the UI that respond to loading state changes.

## [Mar 31, 2025 01:18 PM] Documentation Standards Evolution: PURPOSE Over DESCRIPTION
**Context:** Refactored documentation format across the codebase to standardize comment structure and improve clarity.
**Lesson:**
- Changing "DESCRIPTION" to "PURPOSE" in documentation comments provides clearer focus on a component's role rather than just what it does.
- Adding return types to function descriptions (e.g., `functionName() → ReturnType`) improves developer understanding of component interfaces.
- Consistently formatting documentation across components makes onboarding and maintenance more efficient.
- These small changes have a significant impact on code readability and developer experience.
**Related Methods/Concepts:**
- Documentation standards
- Code commenting best practices
- Type annotations
- Developer experience (DX)
- Knowledge transfer
**Future Improvements:**
- Consider automating documentation format verification in the CI pipeline.
- Add a documentation guide to the project README for consistent documentation in future components.

## [Mar 29, 2025 01:05 PM] Immutability in State Updates is Crucial for Visual Consistency
**Context:** Debugging streak intensity visual bugs in the calendar. Tests passed, but visually, intensity didn't update correctly for "gap filling" or "streak breaking" scenarios after refactoring logic into the `useCalendarData` hook.
**Lesson:**
- Directly mutating object properties within state arrays (even intermediate ones like `allDays`) before setting state can lead to subtle bugs where React/memoization doesn't detect changes correctly, causing visual inconsistencies despite seemingly correct logic.
- Refactoring `recalculateStreaksAndIntensity` to always create and return *new* `DayData` objects resolved the visual issues.
**Related Methods/Concepts:**
- React state updates
- Immutability
- `useState`, `useCallback`, `React.memo`
- Object references vs. values
- Debugging state inconsistencies
- `recalculateStreaksAndIntensity`
**Future Improvements:**
- Prioritize immutable updates when refactoring state logic.
- If visual bugs occur despite passing tests, suspect mutation or state propagation issues.

## [Mar 29, 2025 12:50 PM] Add Specific Tests for Edge Cases Identified During Debugging
**Context:** Debugging streak intensity visual bugs ("gap filling", "streak breaking"). Initial tests passed, but the specific visual bugs weren't covered.
**Lesson:**
- When encountering bugs or regressions not caught by existing tests, add specific, behavior-focused test cases that reproduce the failing scenario (e.g., setting up the specific "gap" state and asserting the expected intensity outcome).
- This aligns with TDD/BDD and prevents future regressions for that specific edge case.
**Related Methods/Concepts:**
- Test-Driven Development (TDD)
- Behavior-Driven Development (BDD)
- Unit testing
- Regression testing
- Edge case testing
- `@testing-library/react-hooks`
- `useCalendarData.test.ts`
**Future Improvements:**
- During the Red phase or when debugging, actively consider edge cases derived from BDD scenarios or observed behavior and write tests for them.

## [Mar 29, 2025 12:21 PM] Test Focus: Hook Logic vs. Component Interaction
**Context:** Discussing where tests for streak calculation logic should reside after refactoring from `CalendarGrid` to `useCalendarData`. Reviewing `bdd-calendar-interaction.md`.
**Lesson:**
- Tests for core calculation logic (like streak/intensity) belong with the unit responsible for that logic (the `useCalendarData` hook test file).
- Tests for the component using the hook (`CalendarGrid.test.tsx`) should focus on verifying the *interaction* with the hook (calling functions, rendering received data) rather than re-testing the hook's internal calculations.
- This aligns with BDD principles where scenarios define behavior, and unit tests verify the implementation of that behavior in the correct module.
**Related Methods/Concepts:**
- Unit testing
- Integration testing (component-hook)
- Separation of concerns
- Mocking hooks (`jest.spyOn`, `jest.mock`)
- BDD
**Future Improvements:**
- When refactoring logic into hooks/services, ensure tests are also refactored to target the correct unit and responsibility level, guided by BDD scenarios.

## [Mar 28, 2025 07:43 PM] Mode File Editing Restrictions
**Context:** Attempting to edit a `.test.tsx` file in a TDD mode restricted to `.test.js` or `.test.ts`.
**Lesson:**
- Specialized modes may have restrictions on the file types they can edit.
- If a file modification fails due to restrictions, switching to a less restrictive mode (like 'Code' or 'Lean Prompt Code') or adjusting mode settings is necessary.
- Using sub-tasks for mode switching can help preserve the main task's context.
**Related Methods/Concepts:**
- Mode capabilities
- File patterns
- Tool restrictions
- Sub-tasking
- Context management
**Future Improvements:**
- Be aware of potential mode restrictions when planning file edits.
- Use sub-tasks for mode switches if context preservation is important.
- Confirm mode capabilities if unsure.

## [Mar 28, 2025 07:42 PM] Missing Test Dependencies
**Context:** Encountering a TypeScript error `Cannot find module '@testing-library/react-hooks'` after creating a new test file using it.
**Lesson:**
- Ensure necessary testing libraries (like `@testing-library/react-hooks` for hook testing) are installed as dev dependencies in the project before writing tests that use them. Check `package.json`.
**Related Methods/Concepts:**
- Dependency management (yarn/npm)
- Testing libraries
- TypeScript errors
- `package.json`
**Future Improvements:**
- Verify required dependencies before writing code/tests that rely on them.