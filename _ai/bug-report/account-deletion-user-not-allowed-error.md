# Account Deletion "User Not Allowed" Error - Root Cause Analysis

## Bug Summary
Account deletion functionality fails with "User not allowed" error when users attempt to delete their accounts through the settings screen. The user remains in the Supabase database despite the deletion attempt.

## Error Details
- **Error Message**: "User not allowed"
- **Error Code**: UNKNOWN_ERROR
- **Location**: AccountDeletionService Error log
- **User Impact**: Users cannot delete their accounts, violating App Store compliance requirements

## Console Logs
```
(NOBRIDGE) ERROR AccountDeletionService Error: {"code": "UNKNOWN_ERROR", "details": undefined, "message": "User not allowed"}
```

## Root Cause Analysis

### Primary Issue: Admin Permission Mismatch
The account deletion service attempts to use **admin-level permissions** from a **client-side** context, which is not permitted by Supabase's security model.

### Technical Details

#### Problem Location
File: `lib/services/AccountDeletionService.ts:47`
```typescript
await this.supabaseClient.auth.admin.deleteUser(request.userId);
```

#### Supabase Client Configuration
File: `config/supabase.ts`
- Uses `EXPO_PUBLIC_API_KEY` (public/anon key)
- Initialized with client-side permissions only
- No admin/service-role credentials available

### Why This Fails

1. **Permission Levels in Supabase**:
   - **Client Operations**: User authentication, profile updates, data queries with RLS
   - **Admin Operations**: User deletion, role management, bypassing RLS

2. **Current Setup Analysis**:
   - App uses public API key for client-side operations
   - `auth.admin.deleteUser()` requires service-role permissions
   - Client permissions cannot execute admin operations

3. **Security Model**:
   - Supabase prevents client-side admin operations by design
   - Service-role key needed for admin operations
   - Service-role keys must be kept server-side for security

## Architecture Impact

### Files Affected
- `lib/services/AccountDeletionService.ts` - Contains the problematic admin call
- `context/AccountDeletionContext.tsx` - Handles deletion flow and error states
- `components/ui/settings/AccountDeletionModal.tsx` - User interface for deletion
- `config/supabase.ts` - Client configuration with public key only

### BDD Scenario Compliance
Current implementation violates BDD requirements:
- ❌ "Supabase authentication account is permanently deleted"
- ❌ "Previous credentials are no longer valid for login"
- ❌ App Store compliance requirement for immediate account deletion

## Solution: Supabase Edge Function for True Account Deletion

**ONLY VIABLE APPROACH**: Create Supabase Edge Function with service-role key for complete user deletion

### Implementation Details

**Edge Function Approach**:
- Deploy serverless Edge Function in Supabase ecosystem
- Use service-role key server-side for `auth.admin.deleteUser()`
- Client makes authenticated HTTP request to Edge Function
- Function verifies user identity via JWT and performs deletion
- Complete removal from Supabase auth system

**Code Changes Required**:
```typescript
// Current problematic code (AccountDeletionService.ts:47)
await this.supabaseClient.auth.admin.deleteUser(request.userId); // ❌ FAILS

// New approach
const response = await fetch('/functions/v1/delete-account', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});
```

**Edge Function Implementation**:
```typescript
// Edge Function (runs server-side)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!, 
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Verify user from JWT, then delete
await supabaseAdmin.auth.admin.deleteUser(userId);
```

### Why This is the Only Solution

**Supabase Security Model**:
- `auth.admin.deleteUser()` requires service-role permissions
- Service-role keys CANNOT be exposed in client-side code
- Direct auth.users table manipulation is prevented by Supabase
- Edge Functions provide secure server-side execution environment

**BDD Compliance**:
- ✅ "Supabase authentication account is permanently deleted"
- ✅ "Previous credentials are no longer valid for login"
- ✅ Meets App Store Review Guidelines 5.1.1(v)

**Technical Benefits**:
- Complete account deletion from Supabase auth
- Serverless (no infrastructure management)
- Built into Supabase ecosystem
- Automatic session cleanup and JWT invalidation
- Maintains all security best practices

## Implementation Steps Required

1. **Create Supabase Edge Function**: Deploy delete-account function with service-role key
2. **Update AccountDeletionService**: Replace admin call with Edge Function HTTP request
3. **Add Error Handling**: Handle Edge Function responses and network failures
4. **Update Environment**: Configure SERVICE_ROLE_KEY for Edge Function
5. **Test Complete Deletion**: Verify user removal from Supabase auth dashboard
6. **Validate App Store Compliance**: Confirm true account deletion meets requirements

## Technical Notes

### Modal Warnings
Multiple modal warnings in logs suggest UI rendering issues:
```
(NOBRIDGE) WARN Modal with 'pageSheet' presentation style and 'transparent' value is not supported.
```
These are separate UI concerns but may indicate state management issues during deletion flow.

### Database State
User remains in Supabase dashboard after deletion attempt, confirming that the admin operation failed and no cleanup occurred.

## Next Steps

1. **Deploy Edge Function**: Create and deploy Supabase Edge Function for account deletion
2. **Update Client Code**: Modify AccountDeletionService to call Edge Function endpoint
3. **Add Comprehensive Logging**: Track deletion attempts through Edge Function
4. **Verify True Deletion**: Test that users are completely removed from Supabase auth
5. **Update Documentation**: Document Edge Function deployment and usage

## App Store Compliance Impact

Current failure directly violates App Store Review Guidelines 5.1.1(v) requiring:
- Immediate account deletion capability
- No grace period or recovery options
- Clear user control over deletion process

Resolution is critical for App Store approval and user trust.