# MEMORY.md

## [June 16, 2025 2:45 PM] EAS TestFlight Deployment: Production-Ready iOS Distribution Pipeline
Context: Successfully implemented and deployed EAS (Expo Application Services) build configuration for iOS TestFlight distribution, establishing end-to-end automated deployment pipeline from code to app store.
Lesson:
- EAS Build Configuration Architecture:
  - eas.json configuration with multiple build profiles (development, preview, production) enables flexible deployment strategies
  - Resource class optimization (m-medium) balances build performance with cost efficiency within EAS free tier
  - Environment-specific configuration (Node.js version, environment variables) ensures consistent build environments
  - Direct submission configuration eliminates manual App Store Connect workflows
- Dependency Management in Production Builds:
  - NPM_CONFIG_LEGACY_PEER_DEPS resolves React 18 compatibility issues with @testing-library/react-hooks
  - Legacy peer deps configuration prevents build failures from dependency resolution conflicts
  - Node.js version pinning (20.18.0) ensures consistent build environment across deployments
  - Production build environment variables enable different behavior from development builds
- Apple Developer Integration Patterns:
  - EAS CLI interactive credential management simplifies Apple Developer account integration
  - Automated credential handling reduces manual setup overhead and improves security
  - Direct App Store Connect submission from EAS eliminates .ipa download and manual upload steps
  - Bundle identifier consistency across eas.json, app.json, and Apple Developer portal prevents build failures
- Deployment Pipeline Optimization:
  - End-to-end automation from git commit to TestFlight availability reduces deployment friction
  - Resource class selection impacts build time and cost - m-medium provides good balance for small teams
  - Automated submission enables rapid iteration cycles and reduces human error in deployment process
  - Build artifact management handled automatically by EAS without local storage requirements
- Production Deployment Best Practices:
  - Separate build profiles for different environments enable staged deployment approaches
  - Automated submission pipelines reduce deployment overhead and enable consistent release processes
  - Cost optimization through resource class selection makes professional deployment accessible
  - Configuration management through version control ensures reproducible deployments
Related Methods/Concepts:
- EAS Build and Submit services architecture and configuration
- Apple Developer Program integration and credential management
- iOS app distribution through TestFlight and App Store Connect
- CI/CD pipeline optimization for mobile app deployment
- Production build configuration and environment management
- Dependency resolution strategies for React Native applications
Future Improvements:
- Implement automated testing integration before builds to prevent broken deployments
- Add build status notifications and monitoring for deployment pipeline visibility
- Create branch-based deployment strategies for feature testing and staging environments
- Develop deployment analytics and success rate tracking for pipeline optimization

## [June 16, 2025 2:30 PM] Free Trial Implementation: Comprehensive Subscription Management with RevenueCat Integration
Context: Successfully implemented 7-day free trial for weekly subscription (commit a249607) using TDD approach with comprehensive test coverage and RevenueCat integration for subscription flow management.
Lesson:
- TDD Approach for Complex Subscription Logic:
  - BDD scenario development for subscription states (active, trial, expired, cancelled) provides clear behavioral specifications
  - Test-first approach for subscription management enables reliable state transitions and user experience validation
  - Comprehensive test coverage despite external SDK dependencies (RevenueCat) through strategic mocking patterns
  - Integration testing strategies for subscription flows validate end-to-end user experiences
- RevenueCat Integration Challenges and Solutions:
  - External SDK testing requires careful mocking of react-native-purchases methods to simulate trial states
  - RevenueCat trial state management through subscription status tracking (active, trial, expired)
  - PaywallScreen logging improvements provide essential debugging capabilities for subscription flow issues
  - SubscriptionContext architecture with isTrialActive computed property enables clean UI state management
- Subscription State Architecture:
  - SubscriptionContext enhanced with trial-specific state management (isTrialActive, subscriptionStatus)
  - Clear separation between subscription validation logic and UI presentation through computed properties
  - Trial activation and expiration flow implementation with proper state transitions
  - Integration with existing subscription management without breaking current functionality
- Testing Strategies for External Dependencies:
  - Mock implementation challenges with react-native-purchases SDK require comprehensive mocking strategies
  - BDD scenarios translated to unit tests provide behavior validation despite mocking complexity
  - Integration test approaches for subscription flows balance mocking with realistic user experience validation
  - Test environment setup considerations for subscription-dependent features
- Technical Implementation Highlights:
  - Enhanced SubscriptionContext with trial state tracking and validation logic
  - PaywallScreen improvements for trial display and user guidance
  - Comprehensive error handling for trial activation and subscription state changes
  - Integration testing framework for complex subscription workflows with external dependencies
Related Methods/Concepts:
- Test-driven development for subscription management systems
- RevenueCat SDK integration patterns and best practices
- React Context API for subscription state management
- External SDK mocking strategies and testing approaches
- Subscription lifecycle management and state transitions
- BDD scenario development for complex business logic
Future Improvements:
- Implement automated subscription state monitoring and alerting
- Add analytics tracking for trial conversion and subscription engagement
- Create comprehensive subscription testing framework for easier future feature development
- Develop subscription state debugging tools for better development experience


## [June 16, 2025 11:19 AM] Next Steps Decision Framework: Structured Post-Review Action Planning
Context: Added comprehensive decision framework to hybrid code review guidelines for determining appropriate follow-up actions after code review completion.
Lesson:
- Code Review Action Categorization Framework:
  - Action Decision Matrix with severity-based categorization prevents important issues from being overlooked
  - Immediate actions (Critical/High severity) ensure production stability and security
  - Next Sprint actions (Medium severity) maintain code quality without blocking delivery
  - Future Backlog (Low severity) enables technical debt tracking without overwhelming current work
  - Clear severity thresholds (9-10: Critical, 7-8: High, 5-6: Medium, 3-4: Low) create consistent decision-making
- Structured Follow-up Process:
  - Post-review decision framework prevents the common issue of reviews identifying problems but lacking clear next steps
  - Time-based categorization (Immediate, Next Sprint, Future Backlog) aligns technical improvements with business priorities
  - Enhanced reviewer accountability through clear action ownership and timing expectations
  - Integration with existing sprint planning processes ensures quality improvements are properly resourced
- Quality Assurance Through Process:
  - Decision framework bridges the gap between code review feedback and actual implementation improvements
  - Systematic approach to technical debt prevents accumulation of unaddressed quality issues
  - Clear escalation paths for critical issues ensure rapid response to security or stability concerns
  - Documentation of action decisions creates audit trail for quality improvement efforts
Related Methods/Concepts:
- Code review best practices and structured feedback
- Technical debt management and prioritization frameworks
- Agile sprint planning integration with quality assurance
- Risk assessment and categorization methodologies
- Post-review action tracking and accountability systems
Future Improvements:
- Implement automated tooling to track action item completion rates
- Add metrics dashboard for review effectiveness and follow-through
- Create integration with project management tools for seamless action tracking
- Develop template responses for common action categories to improve reviewer efficiency

## [June 16, 2025 10:01 AM] TDD Orchestrator Documentation: Comprehensive Testing Framework Implementation
Context: Introduced extensive TDD orchestrator documentation system with specialized agents for different phases of test-driven development workflow.
Lesson:
- Comprehensive TDD Workflow Documentation:
  - Created dedicated agents for each TDD phase (Red, Green, Refactor) with specific responsibilities and guidelines
  - Separation of Unit and Integration testing phases provides clear guidance for different testing levels
  - SUT (System Under Test) structure creation agent ensures consistent test architecture from the start
  - Gherkin scenarios agent standardizes behavior-driven development approach across the project
- Contract-First Feature Fortress Implementation:
  - Enhanced code quality guidelines with fortress integrity heuristics focusing on feature boundary definition
  - Mandatory quality protocol requires contract definition before implementation to prevent architectural drift
  - Clear triggers for enhanced review (>30 lines, >5 conditions, >3 nesting levels) provide objective quality gates
  - Prevention checklist ensures type safety, error handling, performance, and testing considerations are addressed upfront
- Specialized Agent System Architecture:
  - Each TDD phase has dedicated documentation with specific focus areas and quality criteria
  - Modular agent system allows for specialized expertise while maintaining workflow coherence
  - Experimental agent structure enables iteration on TDD processes without disrupting main development flow
  - Documentation-driven approach ensures consistent application of TDD principles across team members
- Quality Assurance Integration:
  - TDD orchestrator integrates with existing code quality guidelines to create comprehensive development framework
  - Clear quality verification checkpoints prevent technical debt accumulation during feature development
  - Structured approach to refactoring ensures improvements are systematic rather than ad-hoc
  - Integration testing agents focus on system-level behavior validation beyond unit testing scope
Related Methods/Concepts:
- Test-driven development methodology and best practices
- Behavior-driven development with Gherkin scenario writing
- Agent-based documentation systems and specialized expertise
- Contract-first development and API design principles
- Quality gate implementation and automated quality assurance
- Feature boundary definition and architectural discipline
Future Improvements:
- Implement automated quality gate validation based on documented criteria
- Create integration between TDD agents and development environment for real-time guidance
- Add metrics tracking for TDD workflow adherence and quality outcomes
- Develop training materials based on agent documentation for team onboarding

## [June 13, 2025 11:20 PM] Security Configuration Management: Controlled Command Execution Framework
Context: Implemented settings configuration for Bash command permissions to establish security boundaries for development environment.
Lesson:
- Development Security Framework:
  - Explicit allow-list approach for Bash commands prevents unauthorized or dangerous command execution
  - Granular permission system (find, grep, ls, mkdir, git commands) balances functionality with security
  - Configuration-driven security enables easy adjustment of permissions without code changes
  - Centralized permission management in .claude/settings.json provides single source of truth for security policies
- Command Execution Control:
  - Limited command set focuses on essential development operations (testing, version control, basic file operations)
  - Git operations (branch, log, show, status, checkout, diff) support standard development workflow while maintaining security
  - Package manager commands (npm test, yarn test) enable testing without broader system access
  - GitHub CLI integration (gh issue) supports issue tracking while maintaining security boundaries
- Development Environment Hardening:
  - Settings-based configuration prevents accidental execution of system-level commands
  - Clear documentation of allowed commands improves development team understanding of boundaries
  - Security-first approach to development tooling reduces risk of environment compromise
  - Configuration file versioning ensures security settings are tracked and auditable
Related Methods/Concepts:
- Development environment security best practices
- Allow-list security model implementation
- Configuration management for development tools
- Principle of least privilege in development environments
- Command execution sandboxing and permission control
Future Improvements:
- Implement logging and monitoring of command execution for security auditing
- Add role-based permissions for different types of development activities
- Create automated validation of security configuration changes
- Develop documentation for secure development environment setup

## [June 13, 2025 10:57 PM] Semantic Detection Enhancement: Intent-Based Task Delegation Optimization
Context: Enhanced delegation triggers with semantic understanding and intent analysis for improved accuracy in automated task routing.
Lesson:
- Semantic Task Analysis Framework:
  - Intent pattern recognition ("Users should be able to...", "I need [system] that...") provides better delegation accuracy than keyword matching
  - Semantic complexity indicators (integration language, multiple system touchpoints) enable smarter task routing
  - Build intent patterns combined with quality indicators ("secure", "scalable", "robust") trigger appropriate specialized handling
  - Enhanced opt-out signals ("quick implementation", "prototype only") prevent over-engineering of simple tasks
- Context-Aware Delegation Strategy:
  - TDD implementation auto-delegation based on semantic patterns rather than rigid keyword matching
  - Research and analysis intent detection through question patterns and exploratory language
  - Parallel analysis patterns for complex problems requiring multiple expert perspectives
  - Delegation rationale explanation improves transparency and learning from automation decisions
- Intelligent Task Categorization:
  - Complexity assessment through language analysis rather than simple pattern matching
  - Production context detection influences delegation to ensure appropriate quality standards
  - Multiple actor scenarios automatically trigger coordination-focused delegation approaches
  - Specialized domain terminology recognition routes tasks to appropriate expertise areas
- Process Optimization Benefits:
  - Reduced manual task categorization overhead through improved semantic understanding
  - Better matching of task complexity with appropriate expertise levels
  - Enhanced parallel execution opportunities through intelligent task decomposition
  - Improved context preservation through smarter sub-agent coordination
Related Methods/Concepts:
- Natural language processing for intent recognition
- Semantic analysis and pattern matching algorithms
- Task delegation frameworks and automation strategies
- Context management and preservation techniques
- Multi-agent coordination and parallel processing
Future Improvements:
- Implement machine learning feedback loop to improve semantic pattern recognition
- Add confidence scoring for delegation decisions to enable manual override when needed
- Create analytics dashboard for delegation effectiveness and accuracy measurement
- Develop custom semantic patterns based on project-specific terminology and workflows

## [June 13, 2025 4:24 PM] Code Quality Framework Evolution: Prevention-Focused Development Approach
Context: Enhanced code quality guidelines with Contract-First Feature Fortress methodology and updated subscription management identifiers for consistency.
Lesson:
- Contract-First Architecture Implementation:
  - Fortress mindset for feature development emphasizes clear boundaries, validation, and error handling
  - Contract definition before implementation prevents integration issues and architectural drift
  - Boundary validation approach ("never trust external data") improves system reliability and security
  - Explicit interface design with proper error handling creates more maintainable and testable code
- Prevention-Focused Quality Assurance:
  - Proactive code quality approach prevents issues during development rather than catching them in review
  - Quality gates based on complexity metrics (function length, condition count, nesting depth) provide objective standards
  - Fail-fast approach with visible error messages improves debugging and system reliability
  - Composition over configuration principle enables better testability and maintainability
- Subscription Management Consistency:
  - Updated subscription identifiers across codebase (context, tests, integration tests) ensures consistent naming
  - Comprehensive test coverage updates maintain reliability during identifier refactoring
  - Integration test updates ensure end-to-end functionality remains intact after changes
  - Cleanup of outdated dependency files (yarn.lock removal) improves project maintenance
- Development Workflow Integration:
  - Code quality protocol integration with existing development processes ensures adoption
  - Clear quality verification steps prevent technical debt accumulation
  - Documentation-driven quality standards improve team consistency and onboarding
  - Fortress integrity heuristics provide practical guidelines for feature development
Related Methods/Concepts:
- Contract-first development and API design principles
- Prevention-focused quality assurance methodologies
- Feature boundary definition and architectural discipline
- Subscription management patterns and consistency practices
- Technical debt prevention and quality gate implementation
Future Improvements:
- Implement automated quality gate validation based on fortress integrity heuristics
- Create development environment integration for real-time quality feedback
- Add metrics tracking for quality standard adherence and outcomes
- Develop training materials and workshops based on Contract-First Feature Fortress methodology

## [June 10, 2025 11:31 AM] Feature Integration and Branch Management: Send Feedback Feature Merge Completion
Context: Successfully merged feat/send-feedback-link branch into main branch, completing the integration of feedback functionality into the settings screen.
Lesson:
- Feature Branch Completion and Integration:
  - Successful merge of feature branch demonstrates proper version control workflow and feature development practices
  - Branch integration consolidates feedback functionality development and prepares codebase for release deployment
  - Feature completion through merge commits provides clear project progression and development milestone achievement
  - Streamlined codebase with integrated features reduces technical debt and improves maintainability
- Release Preparation Through Feature Integration:
  - Merging completed features into main branch establishes proper release preparation workflow
  - Consolidated functionality in main branch enables comprehensive testing and quality assurance
  - Feature integration timing aligns with release deployment planning and user testing phases
  - Proper branch management supports continuous integration and deployment practices
- Development Workflow and Project Management:
  - Feature branch workflow demonstrates structured approach to development and code organization
  - Merge completion represents significant project milestone and user functionality delivery
  - Branch management practices support team collaboration and code quality maintenance
  - Version control workflow enables clear tracking of feature development and deployment readiness
Related Methods/Concepts:
- Git branch management and merge workflows
- Feature-driven development practices
- Release preparation and deployment planning
- Continuous integration and version control
- Project milestone tracking and management
Future Improvements:
- Implement automated testing for merged features
- Add deployment pipeline automation for main branch updates
- Create feature flag management for controlled rollouts
- Develop comprehensive release testing procedures

## [June 10, 2025 11:22 AM] User Interface Enhancement and Visual Design: Settings Screen Icon Implementation
Context: Enhanced settings screen with comprehensive icon integration for all options including 'Send Feedback', 'Manage Subscription', and 'Sign Out' with consistent sizing for improved visual hierarchy.
Lesson:
- Visual Design System Implementation:
  - Consistent icon integration across settings options creates cohesive visual design language
  - Default icon size standardization ensures uniform appearance and professional visual presentation
  - Icon addition improves visual hierarchy and helps users quickly identify different settings categories
  - Visual consistency reduces cognitive load and enhances user interface accessibility
- User Experience Enhancement Through Visual Cues:
  - Recognizable icons alongside text options provide immediate visual context for user actions
  - Visual improvements contribute to more intuitive navigation and reduced user confusion
  - Icon implementation aligns with modern design standards and user expectations for mobile applications
  - Enhanced visual clarity supports better user engagement and satisfaction with app interface
- Settings Interface Design Patterns:
  - Icon integration in settings screens follows established mobile app design conventions
  - Consistent visual treatment of settings options improves discoverability and usability
  - Visual hierarchy through icons helps users understand feature importance and categorization
  - Design system consistency supports scalable user interface development across app sections
- Professional Interface Development:
  - Attention to visual details demonstrates commitment to professional user experience design
  - Icon implementation shows progression from functional to polished user interface development
  - Visual consistency improvements support app store presentation and user acquisition
  - Design system implementation enables future interface scaling and feature additions
Related Methods/Concepts:
- Visual design system development and implementation
- User interface consistency patterns and best practices
- Mobile app design conventions and user expectations
- Settings screen design patterns and usability principles
- Icon design integration and accessibility considerations
Future Improvements:
- Develop comprehensive icon design system for entire application
- Implement accessibility testing for icon-based navigation
- Create design guidelines documentation for future interface development
- Add user testing for settings screen usability and visual effectiveness

## [June 10, 2025 9:27 AM] Accessibility Enhancement and UI Polish: DrinkQuantityInput Component Refactoring
Context: Refactored DrinkQuantityInput component to improve accessibility by replacing Label component with Text component and enhancing visual hierarchy through styling adjustments.
Lesson:
- Accessibility Component Selection:
  - Text component provides more appropriate semantic meaning for display labels compared to Label component
  - Component choice impacts screen reader compatibility and overall accessibility compliance
  - Proper component selection reduces technical debt and improves long-term maintainability
  - Accessibility considerations should guide component architecture decisions from the start
- Visual Hierarchy and Design Standards:
  - Label styling adjustments improve content prominence and readability for users
  - Consistent design standards across components create cohesive user experience
  - Visual hierarchy helps users understand information priority and reduces cognitive load
  - Design system adherence ensures consistent styling patterns across the application
- User Experience Enhancement through Technical Improvements:
  - Technical refactoring directly impacts user experience when focused on accessibility
  - Small component improvements contribute to overall application quality and usability
  - Accessibility improvements benefit all users, not just those with specific needs
  - Continuous component refinement supports better user engagement and satisfaction
Related Methods/Concepts:
- React Native accessibility best practices
- Component selection for semantic meaning
- Visual hierarchy design principles
- Design system consistency patterns
- Technical debt reduction through refactoring
Future Improvements:
- Implement comprehensive accessibility audit across all components
- Create accessibility testing automation for component changes
- Develop accessibility guidelines documentation for team
- Add accessibility metrics tracking for continuous improvement

## [June 9, 2025 12:35 PM] Development Workflow Enhancement and UI Polish: Code Review Documentation and Interface Improvements
Context: Enhanced development workflow through improved code review documentation with concrete examples and implemented UI improvements including rounded button corners, new tab icons, and enabled tab labels.
Lesson:
- Code Review Documentation Enhancement:
  - Concrete code snippet examples in documentation improve clarity and understanding for developers
  - Detailed examples for formatting and handling issues facilitate easier problem identification
  - Enhanced documentation quality contributes to better code review processes and team collaboration
  - Specific examples reduce ambiguity and accelerate development workflow efficiency
- User Interface Polish and Consistency:
  - Rounded corners on buttons contribute to modern, polished visual design language
  - New tab icons improve visual navigation and user interface clarity
  - Enabled tab labels enhance accessibility and user understanding of navigation options
  - UI consistency improvements create more professional and cohesive user experience
- Development Process Optimization:
  - Improved code review processes support better code quality and team knowledge sharing
  - Documentation enhancements reduce onboarding time for new team members
  - Clear examples and guidelines prevent common issues and reduce technical debt
  - Process improvements compound over time to create more efficient development workflow
- Integration of Documentation and UI Improvements:
  - Combining documentation enhancements with UI improvements demonstrates holistic approach to product development
  - Both developer experience and user experience improvements contribute to overall project success
  - Systematic approach to improvements addresses multiple stakeholder needs simultaneously
Related Methods/Concepts:
- Code review best practices and documentation patterns
- User interface design consistency principles
- Development workflow optimization strategies
- Documentation-driven development approaches
- Visual design system implementation
Future Improvements:
- Implement automated code review checklists based on documentation
- Create UI component library documentation with examples
- Develop continuous integration checks for UI consistency
- Add metrics tracking for code review efficiency improvements

## [June 6, 2025 2:34 PM] Application Identity and Branding: Zero Proof Complete Rebranding Implementation
Context: Completed comprehensive rebranding from "Expo Supabase Starter" to "Zero Proof" including app configuration, package management, user-facing content, documentation, and visual assets.
Lesson:
- Comprehensive Branding Strategy Implementation:
  - Complete rebranding requires systematic updates across all application touchpoints for consistency
  - App.json configuration changes establish proper app identity for distribution and app stores
  - Package.json updates ensure development environment reflects proper project identity
  - Systematic approach prevents missed branding elements that could confuse users or stakeholders
- User-Facing Content and Experience Alignment:
  - Welcome screen messaging alignment with app purpose improves user onboarding clarity
  - README documentation updates provide accurate information for developers and stakeholders
  - Consistent messaging across all user touchpoints reinforces app purpose and value proposition
  - Professional presentation through proper branding builds user trust and engagement
- Visual Identity and Asset Management:
  - New app icon and splash screen assets create professional first impression for users
  - Visual consistency between branding elements and app functionality reinforces user understanding
  - Professional visual assets contribute to app store presence and user acquisition
  - Visual identity serves as foundation for future marketing and user engagement efforts
- Technical Foundation for Professional Application:
  - Moving away from generic starter template naming establishes serious application development approach
  - Proper app identity configuration enables professional distribution and deployment processes
  - Brand consistency across technical and user-facing elements creates cohesive development foundation
  - Professional setup supports future scaling and business development requirements
Related Methods/Concepts:
- Application branding and identity management
- App store optimization and professional presentation
- User experience consistency across touchpoints
- Development environment configuration management
- Visual design system implementation
Future Improvements:
- Develop comprehensive brand guidelines documentation
- Create branded marketing materials and app store assets
- Implement brand consistency checking automation
- Add brand analytics tracking for user engagement measurement
- Develop branded onboarding flow enhancements

## [June 6, 2025 11:02 AM] Toast Notification System Implementation: User Feedback and Authentication Experience Enhancement
Context: Implemented comprehensive toast notification system with automatic signup screen dismissal and enhanced user feedback across authentication processes.
Lesson:
- Toast Notification Architecture Implementation:
  - ToastProvider and ToastContainer components provide centralized notification management across the application
  - Proper separation of concerns between notification state management and display components ensures scalable notification system
  - Context-based toast management enables consistent user feedback patterns throughout the application
  - Automatic screen dismissal on signup enhances user flow continuity and reduces manual navigation steps
- Authentication User Experience Enhancement:
  - Integration of toast notifications in SignIn and SignUp components provides immediate feedback for user actions
  - Real-time feedback during authentication processes improves user engagement and reduces uncertainty
  - Email verification notifications in WelcomeScreen ensure users understand next steps in the onboarding process
  - Success and failure notifications help users understand authentication results clearly
- User Interface Feedback Patterns:
  - Immediate visual feedback for user actions improves perceived application responsiveness
  - Toast notifications provide non-intrusive way to communicate system status to users
  - Automatic screen transitions combined with feedback notifications create smooth user experience flows
  - Centralized notification system enables consistent messaging patterns across different app screens
- Development and User Experience Integration:
  - Toast notification system addresses previous user feedback issues documented in bug reports
  - Implementation of user feedback mechanisms reduces user confusion during critical app flows
  - Enhanced authentication experience contributes to overall app usability and user retention
  - Structured notification management supports future expansion of user feedback features
Related Methods/Concepts:
- React Context API for notification state management
- Component composition patterns for notification systems
- User experience design for authentication flows
- Non-intrusive user interface feedback patterns
- Automatic navigation and screen transition handling
Future Improvements:
- Add animation transitions for toast notifications
- Implement different notification types (success, warning, error, info)
- Add notification persistence for critical messages
- Create notification analytics for user engagement tracking
- Implement customizable notification duration settings

## [June 4, 2025 3:32 PM] Settings UX Enhancement and User Session Management: Sign-Out Functionality and UI Consistency
Context: Enhanced settings interface with sign-out functionality, improved layout organization, and updated UI components for better visual consistency and user control.
Lesson:
- User Session Management Implementation:
  - Sign-out functionality in settings provides users with clear control over their session and enhances security
  - User authentication controls should be easily accessible and prominently placed in settings interfaces
  - Session management features improve user trust and provide expected functionality in mobile applications
  - Clear logout options reduce user confusion and provide proper session termination
- Settings Interface Design Patterns:
  - Organized layout in settings screens improves content discoverability and user navigation
  - Visual hierarchy in settings helps users understand feature categories and importance
  - Content organization in settings should group related functionality for better user experience
  - Settings layout updates require consideration of both functionality and visual appeal
- UI Component Consistency and Design System:
  - Avatar component background color adjustments ensure visual consistency across the application
  - Subscription list label improvements provide clearer information display for users
  - UI component consistency reduces cognitive load and creates cohesive user experience
  - Small visual improvements in components contribute to overall application polish
- Project Progress and Task Management:
  - Roadmap updates marking completed tasks (36 and 11.4) provide accurate progress tracking
  - Subscription status display and drink quantity management represent significant feature completions
  - Task completion documentation helps maintain project momentum and stakeholder communication
  - Streamlined roadmap focusing on current priorities improves development focus
Related Methods/Concepts:
- User session management patterns
- Settings interface design principles
- UI component consistency practices
- Project progress tracking methodologies
- Mobile app authentication patterns
Future Improvements:
- Add confirmation dialogs for sign-out actions
- Implement user preference persistence for settings customization
- Create comprehensive design system documentation for UI consistency
- Add analytics tracking for settings usage patterns

## [June 4, 2025 2:22 PM] Project Configuration and iOS Development Setup: Code Signing and Repository Cleanliness
Context: Enhanced project configuration by updating gitignore rules and iOS development settings, along with documenting In-App Purchase flow issues in the roadmap.
Lesson:
- Project Configuration Management:
  - Updated .gitignore to include project.pbxproj files to prevent unnecessary tracking of Xcode project changes
  - Project cleanliness improves repository maintainability and reduces merge conflicts
  - Configuration file management requires careful consideration of what should be tracked vs. ignored
  - Documentation of issues in roadmap helps maintain visibility of user experience problems
- iOS Development Team Configuration:
  - Added development team and provisioning style settings in project.pbxproj for proper code signing
  - Development team configuration is essential for iOS builds and app distribution
  - Provisioning style settings ensure proper code signing workflow during development
  - iOS build configuration requires coordination between project settings and developer accounts
- In-App Purchase Flow Documentation:
  - Enhanced ROADMAP.md to document issues found in the In-App Purchase flow
  - User experience issues during onboarding need clear documentation for prioritization
  - IAP flow problems can significantly impact user acquisition and retention
  - Systematic documentation of UX issues enables better product development planning
Related Methods/Concepts:
- iOS project configuration management
- Git repository maintenance patterns
- Code signing and provisioning workflows
- User experience documentation practices
- Development environment optimization
Future Improvements:
- Implement automated project configuration validation
- Create documentation templates for user experience issues
- Develop standardized code signing workflow documentation
- Add automated checks for repository cleanliness

## [June 3, 2025 3:19 PM] Subscription Protection and Onboarding Integration: Access Control with User Experience Focus
Context: Enhanced subscription management with protected layout integration tests and improved SubscriptionContext for better access control and onboarding flow.
Lesson:
- Subscription-Based Access Control Testing:
  - Integration tests for ProtectedLayout validate subscription-based routing and ensure users without subscriptions are correctly directed to onboarding
  - Test coverage for subscription flows is crucial for maintaining proper access control across app updates
  - Subscription status validation must be thoroughly tested to prevent unauthorized access to premium features
  - User routing based on subscription status requires comprehensive testing scenarios
- Enhanced Subscription Context Architecture:
  - SubscriptionContext with computed properties provides cleaner access control logic throughout the application
  - Centralized subscription state management enables consistent behavior across different app screens
  - Computed properties in subscription context reduce code duplication and improve maintainability
  - Context-based subscription management supports scalable premium feature implementation
- Onboarding Flow Integration:
  - Conditional onboarding display based on subscription status improves user experience for non-subscribers
  - Subscription-aware onboarding ensures users understand premium features and subscription benefits
  - Streamlined onboarding logic reduces complexity in protected layout components
  - User guidance through onboarding process based on subscription status enhances conversion rates
- Repository Configuration Improvements:
  - Updated .gitignore to include .repomix/bundles.json for better project cleanliness
  - Repository maintenance practices contribute to overall development workflow efficiency
  - Consistent file tracking policies reduce repository noise and improve collaboration
Related Methods/Concepts:
- Integration testing for subscription flows
- React Context API for subscription management
- Conditional rendering based on subscription status
- User onboarding optimization patterns
- Repository maintenance best practices
Future Improvements:
- Implement automated subscription status monitoring
- Add analytics for onboarding conversion tracking
- Develop subscription status debugging tools
- Create comprehensive subscription testing framework

## [June 2, 2025 12:04 PM] Subscription Management Architecture: Centralized State for Premium Features
Context: Implemented comprehensive subscription management system with SubscriptionContext for centralized state management and premium feature access control.
Lesson:
- Centralized Subscription State Management:
  - SubscriptionContext provides single source of truth for subscription status across the application
  - Context-based architecture enables consistent premium feature access control
  - Subscription state persistence ensures continuity between app sessions
  - Real-time subscription status updates maintain current user access levels
- Premium Feature Access Control:
  - Subscription checks in protected layouts prevent unauthorized access to premium features
  - Clear subscription management options provide transparency for users
  - Subscription status display in user interface enhances user awareness
  - Seamless integration with onboarding flow improves user experience
- Testing Strategy for Subscription Management:
  - Comprehensive test coverage for subscription context functionality
  - Behavior-driven test scenarios validate subscription lifecycle
  - Mock implementations ensure testing isolation and reliability
  - Error handling verification covers edge cases and failure scenarios
- Project Cleanliness and Maintenance:
  - Updated .gitignore and .rooignore files prevent unnecessary file tracking
  - Removed outdated system prompt files to reduce technical debt
  - Streamlined codebase improves maintainability and focus
  - Enhanced project organization supports sustainable development
Related Methods/Concepts:
- React Context API for subscription state
- Premium feature access patterns
- Subscription lifecycle management
- Test-driven development for subscription features
- Project maintenance and technical debt reduction
Future Improvements:
- Implement automated subscription state validation
- Add subscription analytics for usage patterns
- Develop comprehensive subscription onboarding flows
- Create subscription management UI components

## [May 29, 2025 10:37 AM] User Interface Enhancement: Avatar and Badge Components for Settings
Context: Introduced Avatar and Badge components in settings screen for improved user profile display and subscription status visualization.
Lesson:
- User Profile Enhancement Strategy:
  - Avatar component provides professional visual representation of user profiles
  - Badge component displays subscription status and user information clearly
  - Settings screen integration improves user interface engagement
  - Multiple size variants and status types support flexible UI design
- Documentation and Collaboration Improvements:
  - Enhanced git usage guidelines emphasize grouping related changes in commit messages
  - Expanded user stories documentation provides clearer requirements for subscription features
  - Improved team collaboration through better documentation standards
  - Development workflow optimization through enhanced guidelines
- Component Design Principles:
  - Reusable components support consistent visual design across the application
  - Clear separation of concerns between avatar display and status indication
  - Integration with subscription management enables dynamic status display
  - Professional appearance enhances overall user experience
Related Methods/Concepts:
- Component-based UI architecture
- User interface design patterns
- Subscription status visualization
- Documentation-driven development
- Team collaboration practices
Future Improvements:
- Add animation transitions for status changes
- Implement accessibility features for avatar and badge components
- Create comprehensive design system documentation
- Add user customization options for profile display

## [May 28, 2025 11:27 AM] Behavior-Focused Unit Testing: Module Mocking for Environment Dependencies
Context: Created comprehensive unit tests for RevenueCat configuration with 27 passing tests covering SDK configuration, verification, user management, and purchase operations.
Lesson:
- Module-Level Environment Variable Challenges:
  - Environment variables read at module import time (`const revenueCatApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY`) create tight coupling that's difficult to mock in tests
  - Jest mocks must be applied before module imports and evaluation, requiring complete module mocking rather than selective property mocking
  - Module-level constants evaluated at import time bypass runtime environment variable changes
- Complete Module Mocking Strategy:
  - Use `jest.mock('../module', () => ({ ...originalModule, functionName: jest.fn() }))` for complex external dependencies
  - Implement behavior-simulating mock implementations in `beforeEach` that call underlying SDK methods to verify interactions
  - Mock entire modules when environment dependencies exist at the module level
- Test Quality Assessment Framework:
  - Maintainability (60/60): Behavior-focused, proper abstractions, no implementation details testing
  - Clarity (30/30): Clear naming conventions, single behavior per test, scenario-based organization
  - Isolation (40/40): Independent tests, minimal setup, proper async handling
  - Achieved 100/100 score with comprehensive error scenario coverage
- Behavior-Focused Testing Principles:
  - Test contracts and interactions rather than implementation details
  - Organize tests by behavioral scenarios using `// MARK: - Scenario:` comments
  - Verify SDK method calls and state changes, not internal function logic
  - Cover both success and error scenarios comprehensively
Related Methods/Concepts:
- Jest module mocking strategies
- Environment variable testing patterns
- React Native testing with external SDKs
- Behavior-driven test organization
- Test quality assessment metrics
Future Improvements:
- Avoid module-level environment variable constants in future implementations
- Use dependency injection patterns for environment-dependent configuration
- Create standardized test infrastructure for SDK integrations
- Implement automated test quality validation in CI pipeline

## [May 28, 2025 10:39 AM] Subscription Management Planning: Centralizing State and User Experience
Context: Updated project roadmap with detailed subscription management tasks to ensure proper access control and user transparency for premium features.
Lesson:
- Subscription State Architecture:
  - Centralized subscription state management prevents unauthorized access to premium features
  - Subscription context should be available throughout the app hierarchy for consistent access control
  - Protected layouts need subscription status verification before rendering premium content
  - User visibility into subscription status enhances transparency and reduces confusion
- Access Control Patterns:
  - Implement subscription checks in protected route layouts
  - Provide clear subscription management options for users
  - Display subscription status prominently in user interface
  - Handle subscription state changes gracefully with proper UI updates
- User Experience Considerations:
  - Users need clear visibility into their subscription status
  - Subscription management options should be easily accessible
  - Premium feature access should be clearly communicated
  - Graceful degradation for users without active subscriptions
Related Methods/Concepts:
- React Context API for subscription state
- Protected route patterns
- User interface design for subscription transparency
- Access control implementation
Future Improvements:
- Implement automated subscription state validation
- Create comprehensive subscription management UI
- Add analytics for subscription interaction patterns
- Develop subscription onboarding flows

## [May 24, 2025 09:09 AM] User Feedback and Onboarding Issues: Improving Email Verification Flow
Context: Documented critical user experience issues in the signup process, specifically around email verification feedback and modal dismissal problems.
Lesson:
- Supabase Session Management:
  - Email verification process requires proper session handling and user feedback
  - Modal dismissal issues can occur when session creation doesn't complete properly
  - Toast notifications are essential for communicating verification status to users
  - Missing user feedback creates confusion during the onboarding process
- User Experience Patterns:
  - Clear feedback mechanisms are crucial for email verification workflows
  - Users need immediate confirmation of actions taken during signup
  - Modal state management must coordinate with authentication state changes
  - Onboarding flow should provide clear next steps after email verification
- Error Handling Strategy:
  - Implement comprehensive error handling for authentication flows
  - Provide clear error messages for different verification scenarios
  - Add fallback UI states for when verification is pending
  - Log authentication events for debugging and improvement
Related Methods/Concepts:
- Supabase authentication flows
- React Native modal management
- User feedback systems
- Email verification workflows
Future Improvements:
- Implement comprehensive toast notification system
- Add authentication state debugging tools
- Create fallback UI for verification edge cases
- Develop user feedback analytics for onboarding flows

## [May 23, 2025 02:48 PM] RevenueCat Integration Success: Bundle Identifier Resolution and SDK Setup
Context: Successfully resolved RevenueCat paywall display issues and documented comprehensive integration insights for future development.
Lesson:
- Integration Documentation Value:
  - Detailed documentation of integration challenges saves significant future debugging time
  - Step-by-step resolution guides become valuable team resources
  - Error pattern documentation helps identify similar issues quickly
  - Success stories provide confidence and reference points for similar integrations
- Configuration Management:
  - Bundle identifier consistency across all platforms is critical for successful integrations
  - Project identity updates require coordinated changes across multiple configuration files
  - Testing procedures should verify configuration changes take effect properly
  - Documentation should include verification steps for configuration changes
- Development Workflow Improvements:
  - Clear commit messages help track configuration changes over time
  - Testing on multiple environments ensures configuration robustness
  - Integration milestones should be documented for future reference
  - Team knowledge sharing prevents repeated configuration issues
Related Methods/Concepts:
- RevenueCat SDK integration patterns
- Bundle identifier management
- iOS project configuration
- Development workflow documentation
Future Improvements:
- Create automated bundle identifier validation tools
- Implement integration testing pipelines for RevenueCat functionality
- Develop configuration change checklists for team use
- Add integration success metrics and monitoring

## [May 23, 2025 01:17 PM] Project Identity Updates: Bundle Identifier and Dependency Management
Context: Successfully updated project identity with new bundle identifier and streamlined dependencies for RevenueCat integration.
Lesson:
- Project Configuration Coordination:
  - Bundle identifier changes require updates across app.json, Info.plist, and build configurations
  - Dependency upgrades should be coordinated with feature integration requirements
  - iOS simulator testing confirms configuration changes are properly applied
  - Project structure simplification improves maintainability during major integrations
- Development Focus Strategy:
  - Removing obsolete platform configurations (Android) reduces complexity during critical integrations
  - iOS-first development approach allows for more focused testing and debugging
  - Streamlined project structure reduces potential configuration conflicts
  - Clear project identity facilitates third-party service integrations
- Build Process Optimization:
  - New prebuild processes should be tested thoroughly before committing
  - iOS simulator integration testing validates configuration changes
  - Dependency compatibility should be verified after upgrades
  - Clean build processes help identify configuration issues early
Related Methods/Concepts:
- Expo prebuild configuration
- iOS project management
- Dependency version management
- Platform-specific development focus
Future Improvements:
- Implement automated configuration validation
- Create platform-specific build verification processes
- Add dependency compatibility testing
- Develop configuration change documentation standards

## [May 23, 2025 12:45 PM] RevenueCat UI Component Integration: Native Component Benefits
Context: Successfully replaced custom paywall implementation with RevenueCat's native UI components for improved user experience and functionality.
Lesson:
- Native Component Advantages:
  - RevenueCat UI components provide professional, tested paywall interfaces
  - Native components handle platform-specific UI patterns and behaviors automatically
  - Integration with react-native-purchases-ui reduces custom implementation overhead
  - iOS project file updates are essential for proper native dependency integration
- Development Strategy Evolution:
  - Moving from custom implementations to proven third-party solutions accelerates development
  - Native component integration requires careful iOS project configuration
  - Podfile.lock updates ensure consistent dependency versions across team members
  - Component replacement should maintain existing functionality while improving user experience
- Integration Testing Approach:
  - iOS build verification confirms native dependencies integrate properly
  - UI component testing should verify all paywall functionality works as expected
  - Integration success should be documented for future reference and troubleshooting
  - Project roadmap updates help track integration milestones and next steps
Related Methods/Concepts:
- React Native native module integration
- RevenueCat UI component library
- iOS project dependency management
- Third-party component integration patterns
Future Improvements:
- Create standardized native component integration procedures
- Implement automated testing for native UI components
- Develop integration verification checklists
- Add native component performance monitoring

## [May 22, 2025 02:04 PM] RevenueCat SDK Foundation: Subscription Management Architecture
Context: Implemented comprehensive RevenueCat SDK integration with configuration utilities and example implementations for subscription-based app monetization.
Lesson:
- SDK Integration Architecture:
  - Centralized configuration in dedicated files (config/revenuecat.ts) provides reusable setup patterns
  - Helper functions for subscription management, purchase handling, and status checking streamline development
  - Example implementations (config/revenuecat-example.ts) serve as documentation and development guides
  - Freemium model focus on iOS platform allows for targeted implementation and testing
- Configuration Management Strategy:
  - Dedicated configuration files make SDK setup maintainable and testable
  - Helper utilities abstract complex SDK operations into simple, reusable functions
  - Example code provides clear implementation patterns for team members
  - Platform-specific focus (iOS) reduces complexity during initial implementation
- Development Documentation:
  - ROADMAP updates reflect actual implementation progress and next steps
  - Example code serves as both documentation and validation of integration success
  - Simplified implementation steps make the integration accessible to team members
  - Clear completion tracking helps maintain project momentum
Related Methods/Concepts:
- SDK integration patterns
- Subscription management architecture
- Configuration management
- Documentation-driven development
Future Improvements:
- Add automated testing for RevenueCat integration
- Implement subscription analytics and monitoring
- Create comprehensive error handling for subscription workflows
- Develop subscription state management patterns

## [May 23, 2025 12:36 PM] RevenueCat Paywall Integration: Bundle Identifier Mismatch Resolution
Context: Fixed RevenueCat paywall displaying as red rectangle instead of proper subscription UI by resolving bundle identifier mismatch and implementing proper SDK initialization.
Lesson:
- Bundle Identifier Synchronization:
  - Bundle identifier must match exactly across Expo configuration (`app.json`), RevenueCat dashboard, and App Store Connect
  - Xcode builds can cache old bundle identifiers even after updating Expo configuration
  - Force regenerating iOS project (`rm -rf ios/ && npx expo prebuild --platform ios`) ensures bundle ID changes take effect
  - Clean Build Folder (Cmd+Shift+K) in Xcode is essential after bundle ID changes
  - Verify bundle ID in build logs: look for `[bundleId.debug.dylib]` messages to confirm changes applied
- RevenueCat SDK Initialization:
  - SDK must be initialized before any paywall components render
  - Initialize in root layout (`app/_layout.tsx`) using `useEffect` on component mount
  - Add comprehensive error handling to prevent app crashes from SDK initialization failures
  - Implement verification functions to test SDK connectivity and offerings availability
  - Enhanced logging with emojis and structured messages improves debugging experience
- Error Diagnosis Patterns:
  - "offerings-empty" error typically indicates configuration mismatch, not code issues
  - Customer info retrieval success + offerings failure = bundle ID or product configuration problem
  - Red rectangle in RevenueCat UI component = SDK not properly initialized or no offerings available
  - Build logs showing old bundle identifier = Xcode using cached project files
- PaywallScreen Component Architecture:
  - Implement loading states and error boundaries around RevenueCat UI components
  - Add retry functionality for transient network issues
  - Provide fallback UI when offerings unavailable
  - Include "Continue Without Subscription" option for development/testing
  - Comprehensive logging of all paywall lifecycle events for debugging
- Development Workflow:
  - Test on both simulator and physical device to ensure consistency
  - Use separate git branches for testing configuration changes
  - Backup working builds before making bundle ID changes
  - Force clean builds when configuration changes don't appear to take effect
  - Verify changes in multiple environments (simulator, device, different iOS versions)
Related Methods/Concepts:
- Expo configuration management
- RevenueCat SDK integration
- Bundle identifier management
- iOS build configuration
- Error boundary implementation
- React Context API for SDK initialization
- Xcode project regeneration
- Development environment consistency
Future Improvements:
- Create automated checks for bundle identifier consistency across platforms
- Implement comprehensive integration tests for RevenueCat functionality
- Add bundle identifier validation in CI/CD pipeline
- Consider implementing feature flags for paywall testing
- Document platform-specific configuration requirements for team onboarding

## [May 20, 2025 01:37 PM] Calendar Future Dates Loading: Optimizing Scroll and Load Behavior
Context: Fixed issues with future dates loading in the calendar by improving programmatic scrolling and load trigger coordination.
Lesson:
- Scroll State Management:
  - Programmatic scrolling flags need careful reset timing to prevent interference with user interactions
  - Manual load triggers can ensure consistent data loading after programmatic scrolls
  - Clear separation between programmatic and user-initiated scrolling improves reliability
  - Comprehensive test coverage for scroll scenarios is crucial
- Data Loading Patterns:
  - Future date loading should be triggered consistently regardless of scroll source
  - Load triggers should be coordinated with scroll completion
  - Edge cases like initial load and programmatic scrolling need special handling
  - Performance impact of loading operations should be monitored
Related Methods/Concepts:
- React Native scroll view management
- Infinite scroll implementation
- Programmatic scroll control
- Test coverage for complex interactions
Future Improvements:
- Consider implementing scroll position persistence
- Add performance monitoring for scroll operations
- Create standardized scroll management utilities
- Implement scroll analytics for usage patterns

## [May 19, 2025 01:15 PM] SavingsCounter Modal Implementation: Ensuring Immediate Calculations Update
Context: Implemented a modal for adjusting drink quantity settings in the SavingsCounter component and ensuring immediate updates to savings calculations.
Lesson:
- Modal Integration Patterns:
  - Position modal as a direct child of the parent component to maintain state continuity
  - Use consistent form components between different contexts (onboarding, settings, modal)
  - Implement clear success/failure callback patterns with proper error handling
  - Provide immediate visual feedback for user actions
- State Management Best Practices:
  - Update context state before dismissing modal to ensure UI consistency
  - Implement state verification to confirm updates are applied before UI changes
  - Use effect cleanup functions to prevent state updates after component unmount
  - Add comprehensive error boundaries for better user experience during failures
- Testing Approaches:
  - Test full interaction flow: open modal → input data → submit → verify updates → modal closed
  - Create robust mock implementations that accurately simulate context behavior
  - Test error scenarios explicitly with controlled error injection
  - Use act() and waitFor() appropriately to handle async operations in tests
Related Methods/Concepts:
- React Native Modal component
- Context API state management
- Form submission and validation
- Error handling patterns
- Async operation testing
Future Improvements:
- Create standardized modal wrapper with built-in loading states and error handling
- Add animation transitions for smoother modal interactions
- Implement analytics tracking for form interactions and submission success rates
- Consider micro-frontend architecture for more complex modals

## [May 19, 2025 12:10 PM] React Native Modal and State Management Patterns
Context: Fixed SavingsCounterModal test reliability issues by improving async state management and modal animation handling.
Lesson:
- Modal Animation and State Coordination:
  - Use requestAnimationFrame to coordinate modal animations with state updates
  - Ensure proper cleanup of state when modal is dismissed
  - Handle error cases without leaving modal in inconsistent state
  - Add detailed logging for state transitions and modal events
- Test Reliability:
  - Replace arbitrary timeouts with waitFor assertions
  - Use proper timeout and interval settings in waitFor
  - Split verifications into logical stages
  - Add comprehensive error handling tests
- Implementation Best Practices:
  - Use try/catch for proper error handling
  - Ensure state cleanup even in error cases
  - Add detailed logging for debugging
  - Coordinate state updates with UI changes
Related Methods/Concepts:
- React Native Modal animations
- State management
- Error handling
- Test reliability
- Async operation testing
Future Improvements:
- Consider adding error boundary for better error handling
- Add automated performance monitoring for state updates
- Standardize modal interaction patterns across app
- Create shared modal testing utilities

## [May 19, 2025 11:36 AM] Context-Driven UI Updates: Ensuring Proper State Propagation
Context: Debugged issue where SavingsCounter component did not update after modal changes, revealing gaps in state management and test coverage.
Lesson:
- State Update Propagation:
  - Context updates must trigger appropriate UI refreshes through proper state management
  - Modal dismissal should be coordinated with state updates to ensure UI consistency
  - Success callbacks should verify state updates before closing modals
- Test Coverage Strategy:
  - Tests should explicitly verify the complete interaction flow:
    1. Initial state
    2. User interaction
    3. State update
    4. UI refresh
    5. Final state validation
  - Mock implementations should accurately simulate context behavior
  - Test timing and async operations need careful consideration
- Component Communication:
  - Clear success/failure callback patterns for modal interactions
  - Proper sequencing of state updates and UI changes
  - Verification of state propagation through context hierarchy
Related Methods/Concepts:
- React Context API
- Modal state management
- Async operation handling
- Test timing control
- Mock implementation patterns
- Component lifecycle management
Future Improvements:
- Implement standardized modal interaction patterns with built-in state update verification
- Create test utilities specifically for verifying context-driven UI updates
- Add integration tests focusing on complete interaction flows
- Consider implementing a state management solution with better debugging capabilities
- Document common patterns for modal-context interactions to prevent similar issues

## [May 17, 2025 10:45 AM] Test Development Practices: Framework-Agnostic Testing Principles
Context: Analyzed and improved test development practices while working on SavingsCounter modal component tests, focusing on making testing principles more universal and less framework-specific.
Lesson:
- Test Infrastructure Setup:
  - Pre-requisite checks for test infrastructure are crucial before writing tests
  - Framework-specific setup (mocks, providers) should be separated from behavior testing
  - Test utilities should be organized by responsibility (helpers, mocks, fixtures)
- Testing Strategy Evolution:
  - Shift from implementation details to behavior-focused testing
  - Use BDD scenarios to guide test development
  - Keep test structure flexible for different project architectures
  - Focus on universal testing principles over framework-specific patterns
- Quality Indicators:
  - Clear scoring system for test quality (maintainability, clarity, isolation)
  - Explicit quality thresholds for different aspects of tests
  - Regular evaluation of test effectiveness
- Test Organization:
  - Group tests by behavior/scenario using clear naming conventions
  - Maintain consistent test structure across different test types
  - Separate setup, action, and verification phases
Related Methods/Concepts:
- Test-Driven Development (TDD)
- Behavior-Driven Development (BDD)
- Test infrastructure organization
- Quality metrics for tests
- Framework-agnostic testing principles
- Test isolation and maintainability
Future Improvements:
- Create standardized test setup templates for common testing patterns
- Implement automated test quality checks
- Develop framework-specific implementations of universal testing principles
- Add visual documentation for test organization patterns

## [May 16, 2025 11:13 AM] Drink Quantity Management: Balancing User Input and Financial Calculations
Context: Implemented comprehensive drink quantity input system with integration into onboarding flow and settings, affecting savings calculations.
Lesson:
- Component Architecture:
  - Separating input logic (DrinkQuantityInput) from container components (OnboardingDrinkQuantityContainer, SettingsDrinkQuantityContainer) improves reusability
  - Using React Hook Form with Zod validation ensures consistent form handling and validation across different contexts
  - Container components handle context-specific behavior while sharing core input functionality
- Data Flow Design:
  - Local storage integration for drink quantity persistence
  - Financial service updates to incorporate drink quantity in savings calculations
  - SavingsDataContext enhancement to manage drink quantity state
  - Clear separation between input handling and financial calculations
- Testing Strategy:
  - Comprehensive test coverage for both input components and integration
  - BDD scenarios defining expected behavior in different contexts
  - Validation testing for edge cases and user interactions
  - Integration tests for savings calculation accuracy
Related Methods/Concepts:
- Form handling with React Hook Form
- Zod schema validation
- Component composition
- Context API integration
- Local storage persistence
- Financial calculation services
Future Improvements:
- Consider adding drink type categorization for more accurate cost calculations
- Implement data migration strategy for future schema changes
- Add analytics tracking for usage patterns
- Consider cloud sync for multi-device consistency

## [Apr 30, 2025 11:48 AM] Type Safety and Documentation in Onboarding Components
Context: Enhanced TypeScript declarations and documentation for onboarding components to improve maintainability and developer experience.
Lesson:
- TypeScript Type Declaration Improvements:
  - Adding detailed type declarations for third-party libraries enhances IDE support and catches potential issues early
  - Type declarations should cover not just props but also internal types used by the component
  - Well-typed components reduce runtime errors and improve code maintainability
- Documentation Strategy:
  - Documentation should cover both component purpose and integration points
  - Inline comments should explain complex logic and business decisions
  - Clear documentation reduces onboarding time for new developers
Related Methods/Concepts:
- TypeScript type declarations
- Documentation standards
- Component API design
- Developer experience optimization
Future Improvements:
- Consider automating type generation where possible
- Add example usage snippets in documentation
- Implement documentation testing to ensure docs stay current
- Create visual documentation with component previews

## [Apr 29, 2025 12:47 PM] Paywall Integration: Monetization Through User Journey
Context: Added PaywallScreen component as the final step in the onboarding flow, focusing on natural progression to premium features.
Lesson:
- User Journey Design:
  - Placing premium offerings after feature showcase creates natural value proposition
  - Static paywall implementation allows for easy A/B testing of different offerings
  - Clear call-to-action encourages immediate conversion
- Component Integration:
  - PaywallScreen maintains independence while integrating with OnboardingComponent
  - BDD scenarios ensure proper validation of critical monetization features
  - Screen transitions maintain smooth user experience
Related Methods/Concepts:
- User experience design
- Monetization strategy
- Component composition
- BDD testing practices
Future Improvements:
- Add analytics tracking for conversion metrics
- Implement A/B testing infrastructure
- Consider dynamic pricing based on user engagement
- Add localization support for pricing display

## [Apr 25, 2025 11:07 AM] Onboarding Flow: Balancing Flexibility and Simplicity
Context: Implemented onboarding flow with `react-native-onboarding-swiper` and static images, simplifying from 7 to 5 screens.
Lesson:
- Onboarding Flow Design:
  - Using static images instead of reusable components for initial screens simplifies implementation while maintaining visual appeal
  - Reducing screen count from 7 to 5 helps prevent user fatigue during onboarding
  - Deferring edit capabilities for post-onboarding settings reduces initial complexity
- Component Integration:
  - `react-native-onboarding-swiper` provides a solid foundation for swipeable onboarding screens
  - Conditionally rendering onboarding in _layout.tsx ensures proper flow control
  - Static assets organized in dedicated directories improve maintainability
Related Methods/Concepts:
- React Navigation flow control
- Static asset management
- Conditional rendering
- Component library integration
- User experience optimization
Future Improvements:
- Consider adding animation transitions between screens
- Implement analytics to track completion rates
- Add progress indicators for multi-step forms
- Consider A/B testing different onboarding flows post-launch

## [Apr 21, 2025 11:04 AM] Timer State Verification: Ensuring Consistency Between Timer Display and Calendar Data
Context: Fixed bug-07 where the timer incorrectly displayed elapsed time even when the current day was not marked as sober, particularly when returning to the app the following day.
Lesson:
- State Verification for Persisted Data: When loading persisted state that affects UI display (like timer running status):
  - Always verify the loaded state against current application conditions
  - Implement explicit verification steps that check if persisted state is still valid
  - Override persisted state when conditions have changed (e.g., today is no longer marked as sober)
  - Add detailed logging of verification steps and decisions for debugging
- Testing Edge Cases with Props: Added `forceNotSober` prop to components for testing specific conditions:
  - Enables direct testing of edge cases without complex setup
  - Allows simulation of specific application states that might be difficult to reproduce
  - Improves test coverage for conditional behavior
  - Separates test concerns from production code
- Component Behavior Consistency: Ensuring timer display accurately reflects calendar data:
  - Timer should display zero when today is not marked as sober, regardless of streak history
  - Persisted timer state should be overridden when today's status changes
  - UI components should have consistent behavior across app restarts and day transitions
  - User expectations about timer behavior should be clearly documented and tested
Related Methods/Concepts:
- State persistence and verification
- React Context API
- Component props for testing
- Edge case testing
- Conditional rendering based on application state
- Debug logging for state transitions
Future Improvements:
- Consider implementing a more robust state verification system for all persisted data
- Add automated tests that simulate day transitions to catch similar issues
- Enhance debug logging with timestamps and context identifiers
- Create a visual indicator when timer is stopped due to today not being marked as sober

## [Apr 18, 2025 10:33 AM] Bug Description Clarity: Improving Documentation for Timer Behavior Issues
Context: Enhanced the description of bug-07 to clarify the specific conditions under which the timer incorrectly displays elapsed time.
Lesson:
- Precise Bug Documentation: Detailed bug descriptions that include:
  - Exact conditions that trigger the issue (current day not marked as sober)
  - Specific timing of occurrence (when returning to the app the following day)
  - Expected vs. actual behavior
  - Impact on user experience
- Test Coverage for Edge Cases: Added BDD scenarios to verify timer behavior under specific conditions, ensuring:
  - Comprehensive test coverage for edge cases
  - Clear validation criteria for bug fixes
  - Documentation of expected behavior for future reference
- Documentation as Communication: Well-documented bugs serve multiple purposes:
  - Guide developers working on fixes
  - Provide context for QA testing
  - Create historical record of issues and their resolution
  - Ensure consistent understanding across the team
Related Methods/Concepts:
- Bug tracking and documentation
- BDD scenario writing
- Edge case identification
- Test coverage planning
- Technical documentation standards
Future Improvements:
- Consider implementing a standardized bug documentation template
- Add visual documentation (screenshots, diagrams) for complex UI behavior issues
- Link bug descriptions directly to relevant test scenarios
- Track bug patterns to identify potential architectural improvements

## [Apr 16, 2025 04:17 PM] Enhanced Cross-Component Interactions via Context: Timer-to-Calendar Navigation
Context: Expanded and improved the feature (US-15) where tapping the SobrietyTimer component automatically scrolls the CalendarGrid to center today's date, with specific focus on handling edge cases like scrolling from distant past dates.
Lesson:
- Preventing Side Effects During Programmatic Scrolling: Added flags (`isProgrammaticScrolling`) to prevent unwanted side effects such as:
  - Loading additional weeks while scrolling to today
  - Multiple scroll operations firing simultaneously 
  - UI flickering during rapid navigation commands
- Performance Optimization: Improved scroll timing and behavior by:
  - Scheduling scroll operations with appropriate delays
  - Using state flags to coordinate complex scroll behaviors
  - Implementing scroll completion detection to manage state
- Integration Testing Strategy: Testing cross-component interactions requires:
  - Mocking both components in their interacting state
  - Simulating real user interactions (tap events)
  - Verifying that the receiving component behaves correctly
  - Testing edge cases like navigating from extremely distant dates
- Debug Tracing: Enhanced logging to track:
  - Scroll state transitions
  - Component communication events
  - Timer interactions and their effects
  - Scroll completion and side effects
Related Methods/Concepts:
- State flags for managing complex UI operations
- Cross-component event coordination
- Touch event handling and propagation
- FlatList scrollToIndex performance considerations
- Timeout management for UI operations
- Integration testing for component communication
Future Improvements:
- Add visual feedback during longer scrolling operations
- Consider implementing a shared navigation service for more complex patterns
- Add gesture support for additional intuitive navigation shortcuts
- Incorporate haptic feedback for touch interactions

## [Apr 10, 2025 02:55 PM] Financial Savings Feature: Service + Context Architecture & Test Setup Learnings
Context: Implemented the Financial Savings Counter feature (Tasks 11.2 & 11.3) using a TDD approach, involving a new service (`FinancialService`), a new context (`SavingsDataContext`), and updates to the `SavingsCounter` component and tests.
Lesson:
- Architecture Choice (Solution 2b): Opted for a dedicated `FinancialService` for calculation logic and a new `SavingsDataContext` for state management and component interaction.
  - Rationale: This separates calculation concerns (service) from UI state and data fetching/coordination (context), aligning with the evolving architecture pattern discussed previously (moving towards services). It avoids further bloating existing contexts like `TimerStateContext`.
- TDD Flow: The TDD process (BDD -> Service Test -> Service Impl -> Context Test -> Context Impl -> Component Test -> Component Impl) worked well for building the feature incrementally.
- Test Setup Challenges (Context Providers): Testing components and contexts that depend on other contexts (`SavingsDataContext` depends on `RepositoryContext` and `TimerStateContext`) requires careful test setup.
  - Solution: Mocking the *values* provided by the dependency contexts is crucial. This often involves creating wrapper components or helper functions (`renderWithProviders`) in test utilities (`lib/test-utils.tsx`) to provide the necessary mocked context values during rendering. Simply mocking the context hook itself (`useRepository`, `useTimerState`) is often insufficient if the component under test relies on the provider structure.
  - Example: `SavingsDataContext.test.tsx` needed wrappers to provide mock `RepositoryContext` and `TimerStateContext` values.
- Context Dependency Management: Introducing new contexts requires updating the main application layout (`app/_layout.tsx`) to include the new provider, ensuring the context is available down the component tree.
Related Methods/Concepts:
- Test-Driven Development (TDD)
- Behavior-Driven Development (BDD)
- Service Layer Architecture
- React Context API
- Mocking Context Providers in Tests
- Unit Testing (`@testing-library/react`, `@testing-library/react-hooks`)
- Component Testing
- Dependency Injection (via Context)
- Separation of Concerns
Future Improvements:
- Continue extracting complex logic into services rather than adding it to contexts.
- Refine and standardize the `renderWithProviders` test utility to handle common context combinations easily.
- Add integration tests that cover the interaction flow from `SavingsCounter` through `SavingsDataContext` to `FinancialService` and underlying contexts/repositories.

## [Apr 10, 2025 2:45 PM] Context Architecture Impact on Remote Storage Integration
Context: Evaluated the implications of maintaining the current Context-heavy architecture when implementing Supabase remote storage integration.
Lesson:
- Architectural Stress Points: Adding remote storage to Context-based architecture introduces multiple challenges:
  - Contexts become overloaded with UI state, business logic, AND synchronization responsibilities
  - Error handling becomes complex when network operations are mixed with UI state management
  - Testing becomes difficult due to the need to mock both Context state and remote API responses
  - Offline/online transitions and retry logic get entangled with UI concerns
- Data Flow Complexity: The data flow pattern escalates from `Components → Context → Repository (Local)` to `Components → Context → Repository (Local) + Supabase (Remote)`, creating multiple points of failure in a single layer.
- Integration Strategy for MVP: A pragmatic approach balances immediate delivery with future maintainability:
  1. Initial MVP Implementation:
     - Create a `SupabaseRepository` implementing existing repository interfaces
     - Add minimal sync functionality directly in Context (temporary)
  2. Post-MVP Refactoring (Prioritized):
     - Extract dedicated `SyncService` to manage both repositories
     - Move business logic to appropriate domain services
     - Refine Contexts to focus solely on UI state
- Architecture Evolution Path: The target architecture should transition to `Components → Contexts (UI state) → Services (business logic, sync) → Repositories (Local + Supabase)` to better support complex features like multi-device sync and conflict resolution.
- Technical Debt Assessment: The cost of delaying architecture refactoring increases substantially when adding remote storage, as sync logic is inherently complex and benefits greatly from proper separation of concerns.
Related Methods/Concepts:
- Repository pattern
- Service layer architecture
- Offline-first design
- Synchronization strategies
- Error handling for network operations
- Cross-cutting concerns
- Technical debt management
Future Improvements:
- Begin planning the service extraction refactoring before implementing complex Supabase features
- Implement a basic service for sync operations even in MVP if time permits
- Document sync requirements and edge cases to inform the architecture design
- Consider implementing the Repository pattern with a strategy pattern to easily switch between local, remote, or mixed storage modes
- Prioritize extracting a dedicated error handling service for network operations to maintain a good user experience

## [Apr 10, 2025 11:30 AM] Context vs Services: When and How to Refactor for Sustainable Architecture
Context: Discussed the tradeoffs between keeping business logic in Context providers versus extracting to dedicated services during the MVP phase, specifically examining the CalendarDataContext (768 lines) which contains complex streak calculation logic.
Lesson:
- MVP Focus Prioritization: For MVP development, it's pragmatic to keep business logic in Context initially when it works reliably, deferring architectural refactoring until post-MVP.
- Refactoring Indicators: Key signs that indicate when to extract services from Context include:
  - Context files exceeding 300-500 lines (CalendarDataContext at 768 lines already meets this criterion)
  - Multiple distinct responsibilities in a single file (UI state, calculations, data binding)
  - Difficulty testing logic embedded in Context
  - Duplicated business logic appearing in different Contexts
  - Development pain points like circular dependencies or sluggish UI rendering
- Incremental Refactoring Approach: When refactoring becomes necessary, follow this staged approach:
  - Extract pure calculation functions first (e.g., `recalculateStreaksAndIntensity`)
  - Create service files organized by domain (streak-service.ts, calendar-service.ts)
  - Update Context to call service functions, maintaining the same API for components
  - Add new domain features to services rather than further expanding Context
- Architecture Pattern Evolution: The architecture should gradually evolve toward:
  Components → Contexts (UI state) → Services (business logic) → Repositories (data)
- Pragmatic Development Pattern: Starting simple with Context-based implementations and refactoring later when patterns are clearer is a valid approach that:
  - Enables faster initial development
  - Allows feature validation before architectural commitment
  - Provides clearer understanding of needed abstractions after seeing code in action
Related Methods/Concepts:
- Separation of concerns
- Single responsibility principle
- Context API architecture patterns
- Service layer implementation
- Technical debt management
- Incremental refactoring
- Pure functions and testability
- MVP development priorities
Future Improvements:
- When planning future features, assess whether they should be implemented directly in Context or in a service layer based on complexity and reuse potential.
- Consider setting specific thresholds (e.g., line count, function count) for Context files to trigger refactoring discussions.
- Plan regular "refactoring sprints" post-MVP to address architectural improvements without disrupting feature development.
- Create a shared project document outlining the architecture vision, including the transition plan from Context-heavy to service-oriented design.

## [Apr 9, 2025 11:17 AM] Removing Obsolete Tests Reduces Technical Debt
Context: Removed outdated and unimplemented placeholder tests in `SobrietyTimer.persistence.test.ts` as they were no longer relevant to the application's current state.
Lesson:
- Maintaining placeholder tests that are not implemented creates technical debt and confusion for other developers.
- Tests should be removed or updated when they no longer align with current implementation plans or are deferred to future tasks.
- Keeping test suites clean and relevant improves the overall codebase health and ensures that test failures represent genuine issues.
Related Methods/Concepts:
- Test lifecycle management
- Technical debt reduction
- Clean code practices
- Jest test suite organization
Future Improvements:
- Regularly review and clean up obsolete test files during sprint retrospectives.
- Document test coverage gaps in ROADMAP for future implementation rather than keeping placeholder tests.
- Consider using skipped tests (`test.skip()`) for planned but not yet implemented tests with clear TODOs.

## [Apr 9, 2025 10:57 AM] Strategic Logging Enhances Debugging of State Management Issues
Context: Added detailed debug logs throughout components (`SobrietyTimer`, `StreakCounter`, `DayCell`) to trace state changes and component interactions.
Lesson:
- Strategic placement of debug logs at key state transition points helps identify the sequence of events leading to bugs.
- Logging both the conditions (why a state change occurred) and the results (what changed) provides a complete picture of component behavior.
- When multiple contexts interact (`CalendarDataContext`, `TimerStateContext`), logging the flow between them clarifies complex interactions.
- Conditional log activation (via feature flags or environment variables) allows for detailed debugging without cluttering production logs.
Related Methods/Concepts:
- Debug logging patterns
- React Context API interaction tracing
- State transition debugging
- Cross-component communication tracing
Future Improvements:
- Implement a centralized logging service with configurable log levels for different parts of the application.
- Consider adding performance metrics to logs for state transitions that might affect performance.
- Create visual debug mode that renders state transitions as UI overlays for faster debugging.

## [Apr 9, 2025 10:52 AM] Conditional Timer Control Prevents UI Resets
Context: Debugged an issue where the `SobrietyTimer` and `StreakCounter` UI components incorrectly reset (showing 0 or an unrelated value like 5) when a past calendar date (not part of the current streak) was toggled as 'sober'.
Lesson:
- When a user action (like toggling a past date) triggers state recalculations (streak length) that affect other dependent states (timer running status), ensure that side effects (like stopping/starting the timer) are strictly conditional on the actual outcome of the recalculation, not triggered unconditionally by the action itself.
- In this case, `toggleSoberDay` in `CalendarDataContext` was unconditionally calling `stopTimer()`, causing a brief UI flicker/reset even when the subsequent streak recalculation determined the current streak was unaffected and correctly called `startTimer()` again.
- The fix involved making the `stopTimer()` call conditional within `toggleSoberDay`, only executing it if the recalculated `currentStreak` was actually zero.
- Debugging involved adding detailed logs to both interacting contexts (`CalendarDataContext`, `TimerStateContext`) to trace the state flow and pinpoint the unconditional `stopTimer()` call as the root cause.
Related Methods/Concepts:
- React Context API (`CalendarDataContext`, `TimerStateContext`)
- State management across multiple contexts
- Conditional logic for side effects
- Debugging state synchronization issues
- `useEffect` hook interactions
- Importance of precise state updates to prevent UI flicker/resets
Future Improvements:
- When implementing interactions that span multiple contexts or state slices, carefully map out the sequence of state updates and side effects.
- Ensure functions triggering recalculations wait for the results before enacting side effects like stopping timers, unless the action inherently requires an immediate stop.
- Add integration tests specifically verifying that actions on non-current streak days do not affect the running timer display.

## [Apr 9, 2025 10:51 AM] Data Loading Range & Initial Scroll Timing
Context: Debugged issues where past calendar day statuses weren't persisting on refresh, and the calendar didn't scroll to today correctly on initial load, followed by a regression where toggling any day caused a scroll.
Lesson:
- Data Loading Range: When loading persisted data spanning a wide date range (e.g., calendar statuses), the initial data structure generated on load (`weeks` array in `CalendarDataContext`) must cover the full range of the loaded data, not just a fixed window around the current date. Otherwise, persisted data outside the initial window will be ignored. The fix involved dynamically calculating the start/end dates based on `loadedDayStatus` keys.
- Initial Scroll Timing: A "scroll to today" effect triggered by a loading state (`isLoadingInitial` becoming false) must prevent re-triggering on subsequent renders. Using a `useRef` flag (`initialScrollDoneRef`) ensures the scroll action runs only once after the initial load completes, preventing unwanted scrolls when state updates later (e.g., toggling a day).
Related Methods/Concepts:
- React Context API (`CalendarDataContext`)
- `useEffect` hook dependencies and execution timing
- `useRef` for tracking component state across renders without causing re-renders
- Data persistence (`AsyncStorage`, Repository pattern)
- Initial data hydration strategies
- `FlatList` scrolling (`scrollToToday`)
- Debugging state inconsistencies during initialization
Future Improvements:
- Ensure initial data generation logic always considers the full extent of persisted data.
- When implementing effects triggered by loading states, carefully consider if they should run only once or on every relevant state change, using refs or other state to manage one-time actions.
- Add integration tests verifying both data persistence across refreshes and correct initial scroll behavior.

## [Apr 8, 2025 11:37 AM] Component Integration Enhances User Experience
Context: Implemented scroll to today functionality in the calendar and integrated it with the SobrietyTimer component.
Lesson:
- Creating connections between related UI components (timer and calendar) improves overall user experience by establishing natural interaction patterns.
- Exposing component references (like FlatList refs) through context allows for external control without compromising component encapsulation.
- Touch interactions on informational components (like tapping a timer) can provide intuitive navigation shortcuts without cluttering the UI with additional buttons.
- Tests for user interactions should verify both the technical implementation and the user-facing behavior to ensure reliable functionality.
Related Methods/Concepts:
- React Context API for shared state and functionality
- React's useRef and RefObject for component references
- TouchableOpacity for interaction handling
- FlatList scrollToIndex for programmatic scrolling
- Integration testing for component interactions
Future Improvements:
- Consider adding visual feedback (animation, haptic feedback) when timer is tapped to reinforce the interaction.
- Implement additional gesture-based interactions that follow this pattern of intuitive connections between related components.
- Add accessibility features to ensure interactions are discoverable by all users.

## [Apr 4, 2025 12:10 PM] Context-Based State Management Improves Reliability and Reduces Duplication
Context: Refactored calendar and streak tracking to use a centralized CalendarDataContext instead of isolated component state or hooks.
Lesson:
- Using a shared context for related data (calendar state, weeks, streaks) creates a single source of truth that prevents inconsistencies between components.
- Moving calculation logic from hooks into a context provider simplifies component logic and reduces duplication of state updates.
- Exposing derived values (currentStreak, longestStreak) through context avoids redundant calculations in multiple components.
- Pairing context-based state management with proper persistence (via repository pattern) ensures data consistency between app sessions.
- BDD scenarios help define and validate the expected behavior of components that depend on shared state.
Related Methods/Concepts:
- React Context API
- Context Providers and Consumers
- Repository Pattern
- Derived State
- Separation of Concerns
- Behavior-Driven Development (BDD)
- Unit Testing (React Testing Library)
Future Improvements:
- Consider implementing context selectors to optimize renders when only specific parts of context are used.
- Add more comprehensive integration tests to verify coordination between multiple contexts (e.g., TimerStateContext and CalendarDataContext).
- Explore state management libraries (Redux, Zustand) if context complexity increases.

## [Apr 1, 2025 02:33 PM] TDD & Test Refactoring Learnings
Context: Reflecting on challenges encountered when refactoring tests after introducing shared state management (React Context) for repositories and timer state.
Lesson:
- Introducing shared state/dependency management (e.g., React Context) often necessitates refactoring test setups, even if the core behavior being tested hasn't changed.
- Tests need to provide the necessary environment (e.g., wrapping with Context Providers using mock values) for the component/hook under test to function correctly.
- Changes in how components interact (e.g., calling a context function vs. a direct repository method) require updating test mocks and assertions to match the new interaction patterns.
- While aiming for behavior-focused tests, the test setup must accurately reflect how the unit under test interacts with its boundaries and dependencies.
- Consider anticipating architectural needs (like Context) during the Red phase to make tests potentially more resilient, though this requires balancing foresight with YAGNI.
- Complement unit tests with integration tests for broader validation less sensitive to internal refactoring.
- Refactor tests promptly after the Green phase (or during refactoring) to keep them relevant, trustworthy, and maintainable.
Related Methods/Concepts:
- Test-Driven Development (TDD)
- React Context API
- Mocking (Jest Mocks, Spies)
- Unit Testing (`@testing-library/react`, `@testing-library/react-hooks`)
- Integration Testing
- Test Setup/Environment
- Dependency Injection (via Context)
- Refactoring Tests
Future Improvements:
- Develop standardized test setup helpers/wrappers for common Context configurations.
- Explore strategies for mocking context values more efficiently.
- Ensure BDD scenarios adequately cover interactions involving context.

## [Mar 31, 2025 02:51 PM] Standardizing Documentation Improves Knowledge Transfer
Context: Refactored documentation format across the codebase to standardize comment structure and improve clarity.
Lesson:
- Using "PURPOSE" rather than "DESCRIPTION" in documentation comments directs focus toward component/function role rather than just its behavior.
- Including return types directly in function descriptions (e.g., `functionName() → ReturnType`) creates clearer mental models for developers.
- Removing unnecessary line breaks in documentation comments improves readability.
- Small documentation improvements compound to greatly enhance project maintainability.
Related Methods/Concepts:
- Documentation standards
- Code commenting best practices
- Developer experience (DX)
- Knowledge transfer
- Type annotations
Future Improvements:
- Consider automating documentation formatting checks in the CI pipeline.
- Add a documentation style guide to the project README.

## [Mar 31, 2025 02:48 PM] Deterministic Data Generation Enables Reliable Testing
Context: Refactored `loadMoreWeeks` to use deterministic rules instead of random generation for sobriety status and fixed calendar data loading in `useCalendarData`.
Lesson:
- Using deterministic data generation (based on date patterns rather than `Math.random()`) creates predictable test scenarios and fixes data inconsistencies.
- Setting consistent default values (non-sober status, zero intensity) for new calendar days establishes a reliable baseline for streak calculation.
- Properly implementing async loading patterns with setTimeout(0) and loading state flags improves UI responsiveness during potentially blocking operations.
- Protecting against unwanted actions (like toggling future dates) should happen at the data management layer, not just in the UI.
Related Methods/Concepts:
- Deterministic data generation
- Test predictability
- Asynchronous operations
- Loading state management
- Event loop and setTimeout
- UX during data loading
Future Improvements:
- Replace setTimeout with proper async/await when loading becomes truly asynchronous (API/storage).
- Consider adding loading indicators in the UI that respond to loading state changes.

## [Mar 31, 2025 01:18 PM] Documentation Standards Evolution: PURPOSE Over DESCRIPTION
Context: Refactored documentation format across the codebase to standardize comment structure and improve clarity.
Lesson:
- Changing "DESCRIPTION" to "PURPOSE" in documentation comments provides clearer focus on a component's role rather than just what it does.
- Adding return types to function descriptions (e.g., `functionName() → ReturnType`) improves developer understanding of component interfaces.
- Consistently formatting documentation across components makes onboarding and maintenance more efficient.
- These small changes have a significant impact on code readability and developer experience.
Related Methods/Concepts:
- Documentation standards
- Code commenting best practices
- Type annotations
- Developer experience (DX)
- Knowledge transfer
Future Improvements:
- Consider automating documentation format verification in the CI pipeline.
- Add a documentation guide to the project README for consistent documentation in future components.

## [Mar 29, 2025 01:05 PM] Immutability in State Updates is Crucial for Visual Consistency
Context: Debugging streak intensity visual bugs in the calendar. Tests passed, but visually, intensity didn't update correctly for "gap filling" or "streak breaking" scenarios after refactoring logic into the `useCalendarData` hook.
Lesson:
- Directly mutating object properties within state arrays (even intermediate ones like `allDays`) before setting state can lead to subtle bugs where React/memoization doesn't detect changes correctly, causing visual inconsistencies despite seemingly correct logic.
- Refactoring `recalculateStreaksAndIntensity` to always create and return new `DayData` objects resolved the visual issues.
Related Methods/Concepts:
- React state updates
- Immutability
- `useState`, `useCallback`, `React.memo`
- Object references vs. values
- Debugging state inconsistencies
- `recalculateStreaksAndIntensity`
Future Improvements:
- Prioritize immutable updates when refactoring state logic.
- If visual bugs occur despite passing tests, suspect mutation or state propagation issues.

## [Mar 29, 2025 12:50 PM] Add Specific Tests for Edge Cases Identified During Debugging
Context: Debugging streak intensity visual bugs ("gap filling", "streak breaking"). Initial tests passed, but the specific visual bugs weren't covered.
Lesson:
- When encountering bugs or regressions not caught by existing tests, add specific, behavior-focused test cases that reproduce the failing scenario (e.g., setting up the specific "gap" state and asserting the expected intensity outcome).
- This aligns with TDD/BDD and prevents future regressions for that specific edge case.
Related Methods/Concepts:
- Test-Driven Development (TDD)
- Behavior-Driven Development (BDD)
- Unit testing
- Regression testing
- Edge case testing
- `@testing-library/react-hooks`
- `useCalendarData.test.ts`
Future Improvements:
- During the Red phase or when debugging, actively consider edge cases derived from BDD scenarios or observed behavior and write tests for them.

## [Mar 29, 2025 12:21 PM] Test Focus: Hook Logic vs. Component Interaction
Context: Discussing where tests for streak calculation logic should reside after refactoring from `CalendarGrid` to `useCalendarData`. Reviewing `bdd-calendar-interaction.md`.
Lesson:
- Tests for core calculation logic (like streak/intensity) belong with the unit responsible for that logic (the `useCalendarData` hook test file).
- Tests for the component using the hook (`CalendarGrid.test.tsx`) should focus on verifying the interaction with the hook (calling functions, rendering received data) rather than re-testing the hook's internal calculations.
- This aligns with BDD principles where scenarios define behavior, and unit tests verify the implementation of that behavior in the correct module.
Related Methods/Concepts:
- Unit testing
- Integration testing (component-hook)
- Separation of concerns
- Mocking hooks (`jest.spyOn`, `jest.mock`)
- BDD
Future Improvements:
- When refactoring logic into hooks/services, ensure tests are also refactored to target the correct unit and responsibility level, guided by BDD scenarios.

## [Mar 28, 2025 07:43 PM] Mode File Editing Restrictions
Context: Attempting to edit a `.test.tsx` file in a TDD mode restricted to `.test.js` or `.test.ts`.
Lesson:
- Specialized modes may have restrictions on the file types they can edit.
- If a file modification fails due to restrictions, switching to a less restrictive mode (like 'Code' or 'Lean Prompt Code') or adjusting mode settings is necessary.
- Using sub-tasks for mode switching can help preserve the main task's context.
Related Methods/Concepts:
- Mode capabilities
- File patterns
- Tool restrictions
- Sub-tasking
- Context management
Future Improvements:
- Be aware of potential mode restrictions when planning file edits.
- Use sub-tasks for mode switches if context preservation is important.
- Confirm mode capabilities if unsure.

## [Mar 28, 2025 07:42 PM] Missing Test Dependencies
Context: Encountering a TypeScript error `Cannot find module '@testing-library/react-hooks'` after creating a new test file using it.
Lesson:
- Ensure necessary testing libraries (like `@testing-library/react-hooks` for hook testing) are installed as dev dependencies in the project before writing tests that use them. Check `package.json`.
Related Methods/Concepts:
- Dependency management (yarn/npm)
- Testing libraries
- TypeScript errors
- `package.json`
Future Improvements:
- Verify required dependencies before writing code/tests that rely on them.

## Latest Updates (May 14, 2025)

### Onboarding Flow Implementation
1. Decision: Implemented DrinkQuantityInput component with React Hook Form and Zod validation
   - Rationale: Chose to use React Hook Form for form state management and Zod for validation to maintain consistency with existing form handling patterns in the app.
   - Impact: Improved form handling with built-in validation and error handling.
   - Lessons Learned: 
     - Using a custom hook (useDrinkQuantityForm) helps encapsulate form logic and makes the component more reusable.
     - Zod schema validation provides strong type safety and runtime validation.

2. Decision: Updated build configuration to exclude iOS and Android build artifacts
   - Rationale: Keep the repository clean by excluding generated files from version control.
   - Impact: Improved repository maintenance and cleaner git status.
   - Lessons Learned:
     - Regular maintenance of .gitignore is important as the project grows.
     - Consistent build artifact handling across platforms helps maintain repository cleanliness.

3. Decision: Enhanced iOS development documentation
   - Rationale: Provide clear guidance for developers testing on iOS devices.
   - Impact: Improved developer experience and reduced setup time.
   - Lessons Learned:
     - Clear documentation of platform-specific setup steps is crucial for team productivity.
     - Including troubleshooting steps helps prevent common issues.

4. Decision: Streamlined task analysis process
   - Rationale: Replaced {Task Analysis} with {oodaReasoning} for better clarity.
   - Impact: More cohesive understanding of the reasoning process.
   - Lessons Learned:
     - Clear and consistent terminology improves team communication.
     - Regular refinement of development processes leads to better efficiency.

---
