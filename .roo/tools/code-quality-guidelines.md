# Code Quality Guidelines
**Verification Token: 🎯 QUALITY-CHECKED**

## Purpose
Prevent technical debt during code generation by building quality in from the start. Reference this guide before and during all code creation to avoid common anti-patterns and minimize future refactoring needs.

---

## Core Principle: Prevention Over Refactoring

**Build it right the first time** - Analyze existing codebase patterns, identify potential issues early, and design with separation of concerns from the start.

---

## 🔍 Pre-Implementation Analysis

### Codebase Pattern Analysis
Before adding new code, analyze existing patterns to avoid amplifying technical debt:

```markdown
✅ **Quick Codebase Scan:**
- Find similar functionality patterns
- Identify existing anti-patterns to avoid
- Check complexity levels in related files
- Review existing separation strategies
- Note performance patterns (good and bad)
```

### Quality Baseline Assessment
- **Function Length**: Count lines in similar functions (aim to stay below existing average)
- **Complexity**: Identify most complex existing functions (ensure new code is simpler)
- **Separation**: Find well-separated vs. monolithic examples (follow good patterns)

---

## 🚨 Prevention Triggers (Act Before These Limits)

### Function Complexity
- **Lines > 30**: Start planning separation strategies
- **Conditions > 5**: Extract decision logic to separate functions
- **Nested Levels > 3**: Flatten with early returns or guard clauses
- **Parameters > 4**: Consider object parameters or function splitting

### Module/File Boundaries
- **File > 200 lines**: Plan module separation
- **Class/Context > 150 lines**: Extract specialized services
- **Multiple Responsibilities**: Identify and separate concerns immediately

### Performance Red Flags
- **Expensive Operations in Loops**: Extract and optimize
- **Repeated Calculations**: Memoize or cache from start
- **Heavy Functions Called Frequently**: Design for performance upfront

---

## 🏗️ Design-Time Separation Strategies

### Function Design
```typescript
// ❌ Avoid: Monolithic functions
const handleComplexOperation = (data) => {
  // 50+ lines of mixed concerns
}

// ✅ Prefer: Composed functions
const handleComplexOperation = (data) => {
  const validated = validateInput(data);
  const processed = processData(validated);
  return formatOutput(processed);
}
```

### State Management
```typescript
// ❌ Avoid: Complex nested state
const [complexState, setComplexState] = useState({
  // 10+ properties with interdependencies
});

// ✅ Prefer: Focused state groupings
const [userState, setUserState] = useState(/* user-related only */);
const [uiState, setUIState] = useState(/* UI-related only */);
```

### Business Logic Separation
```typescript
// ❌ Avoid: Logic mixed with components/context
const MyContext = () => {
  // 100+ lines of business logic mixed with React state
}

// ✅ Prefer: Extracted services
const MyContext = () => {
  const businessLogic = useBusinessService();
  // Clean context focused on state management
}
```

---

## 🎯 Type Safety & Error Handling

### Proactive Typing
- **No `any` Types**: Define proper interfaces from start
- **Union Types**: Use specific unions instead of loose types
- **Error Types**: Define expected error shapes upfront

```typescript
// ❌ Avoid
const processData = (input: any) => { /* ... */ }

// ✅ Prefer
interface InputData { /* specific shape */ }
interface ProcessResult { /* expected output */ }
const processData = (input: InputData): ProcessResult => { /* ... */ }
```

### Error Boundaries
- Design error handling at architecture level
- Plan fallback strategies before implementation
- Separate error types by domain/severity

---

## 🧪 Testing Architecture

### Test-Driven Boundaries
- Write failing tests to define interfaces first
- Test complex logic in isolation
- Mock external dependencies from start
- Plan test data factories early

### Coverage Strategy
- **Unit Tests**: Core business logic (aim for 90%+)
- **Integration Tests**: Cross-component interactions
- **Edge Cases**: Error conditions and boundary values

---

## 📐 Architecture Guidelines

### Separation of Concerns
```markdown
**Clear Boundaries:**
- Business Logic ➜ Services/Utilities
- State Management ➜ Contexts/Stores  
- UI Logic ➜ Components
- Data Access ➜ Repositories
- Side Effects ➜ Hooks/Effects
```

### Dependency Direction
- High-level modules should not depend on low-level modules
- Use interfaces/abstractions for external dependencies
- Inject dependencies rather than hardcode

### Module Communication
- Prefer explicit interfaces over implicit coupling
- Use events/callbacks for loose coupling
- Minimize shared mutable state

---

## ⚡ Performance by Design

### Early Optimization Patterns
- **Memoization**: For expensive calculations
- **Virtualization**: For large lists from start
- **Code Splitting**: Plan bundle boundaries early
- **Lazy Loading**: Design async boundaries upfront

### Resource Management
- Plan cleanup strategies (subscriptions, listeners, timers)
- Design with memory usage in mind
- Consider network request patterns

---

## 🚀 Quick Prevention Checklist

### Before Writing Code
- [ ] Analyzed similar existing patterns
- [ ] Identified potential complexity hotspots
- [ ] Planned separation of concerns
- [ ] Designed interfaces and types
- [ ] Considered error handling strategy
- [ ] Planned testing approach

### During Implementation
- [ ] Function staying under 30 lines?
- [ ] Single responsibility per function?
- [ ] Proper typing throughout?
- [ ] Error handling in place?
- [ ] Performance considerations addressed?
- [ ] Test coverage planned?

### Before Completion
- [ ] No obvious refactoring needed?
- [ ] Follows existing good patterns?
- [ ] Improves upon existing anti-patterns?
- [ ] Documentation/comments where needed?
- [ ] Integration points clean?

---

## 🔄 Incremental Improvement Strategy

### When Touching Existing Code
1. **Leave it better**: Small improvements to surrounding code
2. **Extract patterns**: Pull reusable logic into utilities
3. **Add types**: Improve type safety in touched areas
4. **Add tests**: Cover new functionality thoroughly

### Anti-Pattern Migration
- Don't replicate existing anti-patterns
- Extract common logic when adding similar features
- Introduce better patterns gradually
- Document architectural decisions

---

## 📊 Quality Metrics

### Measurable Goals
- **Function Complexity**: Aim for 80% of functions under 20 lines
- **Type Coverage**: 100% TypeScript strict mode compliance
- **Test Coverage**: 90%+ for business logic, 70%+ overall
- **Performance**: No obvious bottlenecks in critical paths

### Code Review Focus
- Separation of concerns clear?
- Performance implications considered?
- Error handling comprehensive?
- Testing strategy adequate?
- Future maintainability?

---

## 🎯 Technology-Specific Patterns

### React/React Native
- Custom hooks for reusable logic
- Context for global state only
- Components focused on rendering
- Use of proper lifecycle patterns

### TypeScript
- Strict mode compliance
- Interface over type for public APIs
- Generic types for reusability
- Proper null/undefined handling

### State Management
- Normalized state structure
- Immutable update patterns
- Selector patterns for derived state
- Action/event-driven updates

---

**Remember**: The goal is to write maintainable, performant, well-tested code from the start. Use this guide to catch issues during design and implementation, not after deployment.