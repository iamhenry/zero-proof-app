---
description: Comprehensive tool for generating TDD-oriented unit tests with proper structure
alwaysApply: false
---

<GenerateUnitTests>
Objective: 
  Use TDD principles to create behavior-focused, maintainable tests with proper separation of concerns.
  Tests should work against contracts rather than implementations, using dependency injection and interfaces.

Scenario Grouping: Use `// MARK: - Scenario: [Scenario Name]` comments to group test cases within files, aligning with BDD scenarios.

Pre-requisites:
  1. Check for existing test infrastructure:
     - Test utilities and helpers
     - Mock implementations
     - Data builders/factories
     - Shared fixtures
  2. Create missing test components if needed:
     - TestHelpers directory for shared utilities
     - Mocks directory for test doubles
     - Fixtures directory for shared test data
     - Builders directory for test data construction

Steps:

1. Red Phase (Write Failing Tests): Follow instructions from `<tdd-red-phase>`
2. Green Phase (Implementation): `<tdd-green-phase>`
3. Refactor Phase: `<tdd-refactor-phase>`

Guidelines:
- Focus on behavior over implementation details
- Write descriptive test file names
- Use dependency injection for better isolation
- Create reusable components only when patterns emerge
- Keep tests focused and isolated
- Wait for confirmation before proceeding to next phase
- Document new shared components
- Consider impact on existing tests
</GenerateUnitTests>