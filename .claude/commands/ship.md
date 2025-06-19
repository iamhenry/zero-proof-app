# Ship iOS Production Build

Automated workflow to build and deploy iOS production build to TestFlight.

## Process

Execute the complete iOS production deployment pipeline:

1. **Increment Build Number**: Update `expo.ios.buildNumber` in app.json (increment by 1)
2. **Quality Gates**: Run `npm run lint && npm run test` to ensure code quality
3. **Production Build**: Execute `eas build --platform ios --profile production`
4. **TestFlight Submission**: Submit with `eas submit --platform ios`

## Error Handling

- Stop execution if any step fails
- Display clear error messages for debugging
- Verify build number was incremented before proceeding
- Confirm EAS CLI is authenticated before building
- Check that production profile exists in eas.json

## Security

- Never expose API keys or credentials
- Use EAS CLI's built-in authentication
- Maintain production environment variable security

## Usage

Simply run: `/project:ship`

This command handles the complete iOS production deployment workflow from build number increment through TestFlight submission.