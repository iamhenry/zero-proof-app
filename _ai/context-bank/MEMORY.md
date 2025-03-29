# MEMORY.md

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

## [Mar 28, 2025 07:59 PM] Tooling Issues: `apply_diff` vs. `write_to_file`
**Context:** Repeated failures using `apply_diff` to modify test files (`.tsx`) and add logs, even with adjusted context or minimal diffs.
**Lesson:**
- The `apply_diff` tool can be sensitive to context matching, especially with larger changes, comments, or subtle file differences.
- If it fails repeatedly, using `write_to_file` with the complete intended file content is a more reliable alternative, although it requires reading the file first to reconstruct the full content.
**Related Methods/Concepts:**
- Tool usage (`apply_diff`, `write_to_file`)
- Diffing algorithms
- File manipulation
**Future Improvements:**
- If `apply_diff` fails, try reducing context significantly first.
- If it still fails, switch to `write_to_file` instead of multiple `apply_diff` attempts to save time.

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