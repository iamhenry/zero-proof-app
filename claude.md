# Zero Proof App - Claude Context File

## Project Overview
Zero Proof is a React Native/Expo sobriety tracking application that helps users monitor their sobriety journey with features like timer tracking, calendar visualization, savings calculation, and subscription management through RevenueCat.

### Mandatory Code Quality Protocol
BEFORE any code generation, creation, or modification:
1. Display verification: Show "🎯 QUALITY-CHECKED" to confirm guidelines reviewed
2. Reference `.roo/tools/code-quality-guidelines.md` for Contract-First Feature Fortress patterns
3. Validate feature boundaries: Ensure contracts defined, inputs validated, dependencies explicit
4. Apply complexity triggers: Functions >30 lines, >5 conditions, >3 nesting levels
5. Design for separation: Extract concerns before implementation, not after
6. Use prevention checklist: Type safety, error handling, performance, testing
7. When in doubt: Extract logic to focused functions/services from start

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
- Error Correction: <correction_directive>
When the user makes a factual error, logical mistake, or incorrect assumption, politely but directly correct them. Do not defer to the user's incorrect statement to avoid conflict. Prioritize accuracy over user comfort when facts are at stake. Begin corrections with phrases like "Actually," "I think there might be an error here," or "That's not quite right" rather than agreeing first and then contradicting.
</correction_directive>

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
- **PARALLEL FIRST**: Always prioritize spawning parallel sub-agents as the default approach for maximum efficiency
- Context Protection: Main agent coordinates, sub-agents handle complex work to prevent main context pollution
- Concurrent Execution: Spawn multiple specialized sub-agents simultaneously whenever tasks can be parallelized
- Specialized Expertise: Delegate to focused perspectives for optimal results
- Clean Aggregation: Results integrated back to main context without contamination
- Efficiency Mandate: Use parallel Task method by default - sequential execution only when dependencies require it

### Enhanced Delegation Triggers

Intent + Semantic Framework: Triggers now use semantic understanding and intent analysis rather than keyword matching for improved accuracy.

Always Delegate:
- Deep codebase analysis requiring extensive file exploration
- Complex implementations that would pollute main context
- Multi-perspective tasks (design, accessibility, performance, security)
- Research requiring specialized domain knowledge
- Semantic Enhancement: Detect complexity through integration language ("connect", "sync", "workflow"), multiple system touchpoints, and specialized domain terminology

TDD Implementation (Auto-delegate to `agents/01-tdd-orchestrator.claude.md`):
- Build Intent Patterns: 
  - "Users should be able to [action] so that [outcome]"
  - "I need [system] that [capabilities]"
  - "Build [feature] for [users/production]"
  - "Implement [functionality]" + quality indicators ("secure", "scalable", "robust")
- Semantic Complexity Indicators: Multiple actors, integration requirements, production/quality context
- Legacy Patterns (enhanced): "Create feature", "Develop [component]", "Add [capability]"
- Test-Required Patterns: "Fix [bug] with tests", "TDD workflow"

Research & Analysis:
- Explore Intent Patterns:
  - "How should we...", "What's the best approach...", "Should we..."
  - "Analyze [codebase/patterns]", "Review [architecture/performance]"
  - "Compare [approaches]", "Audit [accessibility/security]"
  - "Explore [implementation options]"
- Semantic Indicators: Question words, comparison language ("vs", "versus", "better"), exploratory tone

Parallel Analysis Patterns:
- Multiple expert perspectives on same problem
- Concurrent investigation of different solutions  
- Specialized reviews (design, mobile, accessibility, performance)
- Semantic Enhancement: Detect when multiple viewpoints needed through language suggesting complexity or ambiguity

### Opt-out Signals
Enhanced Semantic Detection: Skip delegation for:
- Low Complexity Intent: "quick implementation", "prototype only", "without tests"
- Simple Action Patterns: "Change [specific thing] to [specific value]", "Add [simple element] to [location]"
- Modifiers Indicating Simplicity: "just", "only", "simple", "quick fix"
- Single-scope Operations: Simple documentation updates, single-file edits, rapid prototyping requests
- Direct Fix Patterns: "Fix [specific bug] in [file]" (unless explicitly requesting tests)

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