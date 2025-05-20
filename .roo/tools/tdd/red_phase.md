---
description: Guidelines for implementing the "Red" phase of Test-Driven Development
alwaysApply: false
---

<tdd-red-phase>

### Pre-requisites  
Before writing tests, ensure the necessary test infrastructure exists:  

1. First, locate and read ALL relevant BDD scenarios
   - Extract required components/modules and their relationships
   - Note expected behaviors and outcomes
   - Review implementation notes
   - List all acceptance criteria

2. Check for existing test infrastructure:  
   [ ] Test utilities and helpers
   [ ] Mock implementations
   [ ] Test data generators
   [ ] Shared test fixtures
   [ ] Test configuration

3. Create missing infrastructure if needed (respect platform best practice structure):  
   ```
   tests/
   ├── helpers/        # Test utilities
   ├── mocks/         # Test doubles
   ├── fixtures/      # Test data
   ├── factories/     # Data generators
   └── config/        # Test configuration
   ```

---

## Red Phase Workflow  

### 1. Analyze BDD Scenarios  
- Map each scenario to testable behaviors
- Identify state changes and outputs
- Note required test setup for each scenario

### 2. Set Up Test Infrastructure  
- Create minimal mocks/stubs needed for current behavior
- Set up proper isolation:
  - Fresh test state for each test
  - Isolated dependencies
  - Clear test boundaries
- Example mock pattern (pseudocode):
  ```
  // Language-agnostic mock pattern
  Mock ServiceInterface:
    - Define expected inputs
    - Define expected outputs
    - Add verification methods
  ```

### 3. Write Tests with Guard Rails  
- Focus on behavior over implementation
- Use dynamic assertions:
  ```
  // Instead of:
  assert result equals "fixed value"
  
  // Prefer:
  assert result matches expected pattern
  assert result contains required properties
  assert system transitions to expected state
  ```
- Follow naming convention: `test_[Scenario]_[Condition]_[ExpectedResult]`
- One behavior per test
- Maintain test isolation
- Handle async operations appropriately for your platform

### 4. Test Organization
- Group tests by behavior/scenario
- Maintain consistent structure:
  ```
  test_suite:
    setup/fixtures
    test_cases:
      setup
      action
      verification
    cleanup
  ```

### 5. Verify Failure  
- Tests should fail due to missing implementation
- Not due to:
  - Setup errors
  - Configuration issues
  - Missing dependencies
  - Invalid test structure

---

## 6. Evaluate Tests with Guard Rails  

### Scoring System  
Start at 100 points, deduct for violations:  

#### Maintainability (-60)  
- Tests verify behavior not implementation (-30)
- No over-specification (-15)
- Uses proper abstractions (-15)

#### Clarity (-30)  
- Clear test names and structure (-15)
- Single behavior per test (-15)

#### Isolation (-40)  
- Tests are independent (-30)
- Minimal test setup (-5)
- Proper async/concurrent handling (-5)

### Quality Indicators  
🟢 Excellent (90-100):
- Tests are reliable and maintainable
- Clear behavior verification
- Proper isolation

🟡 Needs Improvement (70-89):
- Some technical debt
- Minor clarity issues
- Potential isolation problems

🔴 Requires Revision (<70):
- Significant reliability issues
- Unclear test purpose
- Poor isolation

### Common Pitfalls
❌ Avoid:
- Testing implementation details
- Shared test state
- Complex test setup
- Brittle assertions

✅ Prefer:
- Behavior-focused tests
- Independent test cases
- Minimal, clear setup
- Robust assertions

---

### 7. Complete the Red Phase  
- Verify all tests fail for the correct reasons
- Ensure tests meet quality standards
- Document any assumptions or requirements
- Ready for implementation phase
- Use `attempt_completion` to finalize the Red phase only when tests fail for the right reasons and meet guardrail standards, reducing the need for back-and-forth revisions.


### Progress Checklist
[ ] BDD analysis complete
[ ] Infrastructure ready
[ ] Tests written
[ ] Tests failing correctly
[ ] Quality standards met

</tdd-red-phase>