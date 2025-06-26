# Ship iOS Production Build

Automated workflow to build and deploy iOS production build to TestFlight.

## Usage

Simply run: `/project:ship`

This command handles the complete iOS production deployment workflow from build number increment through TestFlight submission.

## Process

Execute the complete iOS production deployment pipeline:

1. Pre-flight Checks: 
   - Verify clean git working tree (`git status`)
   - Check EAS authentication (`eas whoami`)
   - Confirm production profile exists in eas.json

2. Increment Build Number: Update `expo.ios.buildNumber` in app.json (increment by 1)

3. Quality Gates: 
   - Run comprehensive tests: `npm test`
   - Skip lint if ESLint v9 migration needed (graceful fallback with warning)

4. Production Build: Execute `eas build --platform ios --profile production --non-interactive`

5. TestFlight Submission: 
   - Parse build URL from output automatically
   - Submit with `eas submit --platform ios --latest` for proper queue management
   - Fallback to manual instructions if interactive auth required

6. Commit Changes: Commit build number increment after successful build

## Error Handling

- Stop execution if any step fails with clear progress indicators
- Display manual fallback instructions for TestFlight submission
- Verify all prerequisites before starting deployment

## Security

- Never expose API keys or credentials
- Use EAS CLI's built-in authentication
- Maintain production environment variable security