# Zero Proof App - Claude Context File

## Project Overview
Zero Proof is a React Native/Expo sobriety tracking application that helps users monitor their sobriety journey with features like timer tracking, calendar visualization, savings calculation, and subscription management through RevenueCat.

### Mandatory Code Quality Protocol
BEFORE any code generation, creation, or modification:
1. Display verification: Show "🎯 QUALITY-CHECKED" to confirm guidelines reviewed
2. Reference `.roo/tools/code-quality-guidelines.md` for prevention patterns
3. Analyze existing codebase patterns to avoid amplifying technical debt
4. Apply complexity triggers: Functions >30 lines, >5 conditions, >3 nesting levels
5. Design for separation: Extract concerns before implementation, not after
6. Use prevention checklist: Type safety, error handling, performance, testing
7. When in doubt: Extract logic to focused functions/services from start

Triggers for Enhanced Review:
- Any function/component creation or modification
- State management changes
- Business logic implementation
- Integration with external services
- Performance-critical code paths

## Key Technologies
- React Native with Expo
- TypeScript
- NativeWind (Tailwind CSS for React Native)
- RevenueCat for subscription management
- Supabase for backend services
- Jest for testing
- React Navigation for routing

## Project Structure
- `/app/` - Expo Router app directory structure
- `/components/` - Reusable UI components with comprehensive test coverage
- `/context/` - React Context providers for state management
- `/lib/` - Business logic, services, and utilities
- `/_ai/` - AI-related documentation and specifications
- `/tests/` - Test configurations and utilities

## Development Guidelines & Best Practices

### Communication Standards
- Concise but Complete: Provide thorough responses without unnecessary verbosity, ensuring no critical information is omitted
- Context Richness: Maintain detailed context while keeping responses focused and actionable
- Teaching Approach: Explain code concepts in simple terms using analogies when helpful
- Visual Aids: Use diagrams and flow charts to illustrate complex code relationships and architecture when applicable

### Git Workflow Management
- Staged Commits: Add changes to staging after each successful development TDD phase
- Success Criteria: Each TDD phase should have clear, measurable completion criteria before staging
- History Context: Leverage git history to understand existing implementation patterns and architectural decisions
- Progressive Integration: Use commit history to track feature evolution and maintain development continuity

### Context Management
- Auto-compact: Trigger context compression at 80% capacity to maintain performance
- Task Delegation: Use task tools for complex operations to prevent main context pollution
- Continuous Evaluation: Regularly assess if new patterns or insights should be added to this guidelines document
- Adaptive Suggestions: Proactively recommend updates to claude.md based on encountered development patterns

### Code Explanation Standards
- Keep technical explanations accessible without being overly verbose
- Use real-world analogies to clarify abstract programming concepts
- Focus on the "why" behind code decisions, not just the "what"
- Provide context for how individual components fit into the larger system architecture

## Sub-Agent Delegation Strategy

### Core Principles
- Context Protection: Main agent coordinates, sub-agents handle complex work
- Parallel Execution: Spawn concurrent sub-agents when possible
- Specialized Expertise: Delegate to focused perspectives
- Clean Aggregation: Results integrated back to main context
- PARALLEL BY DEFAULT: Always use parallel Task method for efficiency

### Delegation Triggers

Always Delegate:
- Deep codebase analysis requiring extensive file exploration
- Complex implementations that would pollute main context
- Multi-perspective tasks (design, accessibility, performance, security)
- Research requiring specialized domain knowledge

TDD Implementation (Auto-delegate to `agents/01-tdd-orchestrator.claude.md`):
- "Implement [feature]" / "Build [functionality]" / "Add [capability]"
- "Create feature" / "Develop [component]"
- "Fix [bug] with tests" / "TDD workflow"

Research & Analysis:
- "Analyze [codebase/patterns]" / "Review [architecture/performance]"
- "Compare [approaches]" / "Audit [accessibility/security]"
- "Explore [implementation options]"

Parallel Analysis Patterns:
- Multiple expert perspectives on same problem
- Concurrent investigation of different solutions
- Specialized reviews (design, mobile, accessibility, performance)

### Opt-out Signals
Skip delegation for:
- "quick implementation" / "prototype only" / "without tests"
- Simple documentation updates
- Single-file edits
- Rapid prototyping requests

### Sub-Agent Coordination
1. Acknowledge delegation with brief rationale
2. Spawn specialized sub-agents (parallel when applicable)
3. Transfer context: requirements, existing patterns, project constraints
4. Aggregate results cleanly in main context

### TDD Workflow Integration
Phases: Red (failing tests) → Green (minimal implementation) → Refactor (optimize) → Integration (compatibility)

### Testing Conventions
- Jest for unit and integration tests
- React Testing Library for component testing
- Mock implementations for external services
- Test files co-located with components (`__tests__/` directories)
- Factory patterns for test data generation

### Code Quality Standards
- TypeScript strict mode
- Comprehensive error handling
- Performance optimization
- Accessibility compliance
- Component reusability
- Consistent naming conventions

## Component Development Guidelines

### UI Components
- Use NativeWind for styling
- Follow existing component patterns in `/components/ui/`
- Include proper TypeScript interfaces
- Implement comprehensive test coverage
- Support dark/light themes where applicable

### Business Logic
- Implement in `/lib/services/`
- Use dependency injection patterns
- Include comprehensive error handling
- Follow repository pattern for data access
- Maintain separation of concerns

### State Management
- Use React Context for global state
- Implement proper loading and error states
- Follow existing context patterns
- Include proper TypeScript typing

## Development Workflow
1. Analyze requirements and existing code patterns
2. Design component/feature architecture
3. Implement using TDD approach (if applicable)
4. Ensure integration with existing systems
5. Verify accessibility and performance
6. Update documentation as needed

This delegation strategy maintains context clarity, enables parallel execution, and ensures specialized expertise while preserving development flexibility.