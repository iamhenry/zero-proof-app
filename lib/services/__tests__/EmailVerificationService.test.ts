/**
 * FILE: lib/services/__tests__/EmailVerificationService.test.ts
 * PURPOSE: Tests for EmailVerificationService
 * SCOPE: Tests email verification token handling
 * [SUPABASE_AUTH_DISABLED] Supabase auth is disabled; verification methods return failure results.
 *   Token parsing and expiry logic still works as before.
 * DEPENDENCIES: Jest, EmailVerificationService SUT
 */

import { EmailVerificationService } from '../EmailVerificationService';
import { VerificationResult, VerificationToken } from '../../types/DeepLinkTypes';

// [SUPABASE_AUTH_DISABLED] Config now exports null -- mock reflects disabled state
jest.mock('@/config/supabase', () => ({
  supabase: null,
  isSupabaseAvailable: false,
}));

describe('EmailVerificationService', () => {
  let emailVerificationService: EmailVerificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    emailVerificationService = new EmailVerificationService();
  });

  // MARK: - Scenario: Verification returns failure when auth is disabled
  describe('when verifying tokens with auth disabled', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_token_payload';

    it('should_return_failure_when_auth_disabled', async () => {
      // Act
      const result = await emailVerificationService.verifyEmailToken(validToken);

      // Assert - Auth disabled, stub always returns error
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should_parse_verification_token_when_valid_token_string_given', () => {
      // Arrange
      const tokenString = 'abc123def456';
      const expectedToken: VerificationToken = {
        token: tokenString,
        type: 'email_verification',
        email: 'test@example.com',
      };

      // Act
      const result = emailVerificationService.parseVerificationToken(tokenString);

      // Assert - Token parsing is local, not affected by auth disable
      expect(result).toEqual(expectedToken);
      expect(result?.token).toBe(tokenString);
      expect(result?.type).toBe('email_verification');
    });

    it('should_return_false_for_updateVerificationStatus_when_auth_disabled', async () => {
      // Act
      const result = await emailVerificationService.updateVerificationStatus();

      // Assert - Auth disabled, stub returns error so result is false
      expect(result).toBe(false);
    });
  });

  // MARK: - Scenario: Error handling with auth disabled
  describe('when handling invalid or expired tokens', () => {
    const invalidToken = 'invalid.token.string';
    const expectedErrorResult: VerificationResult = {
      success: false,
      error: 'Invalid or expired verification token',
    };

    it('should_return_error_when_invalid_token_given', async () => {
      // Act
      const result = await emailVerificationService.verifyEmailToken(invalidToken);

      // Assert
      expect(result).toEqual(expectedErrorResult);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should_return_error_when_expired_token_given', async () => {
      // Act
      const result = await emailVerificationService.verifyEmailToken('expired_token');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should_detect_expired_token_when_expiration_date_passed', () => {
      // Arrange
      const expiredToken: VerificationToken = {
        token: 'expired123',
        type: 'email_verification',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };

      // Act
      const result = emailVerificationService.isTokenExpired(expiredToken);

      // Assert
      expect(result).toBe(true);
    });

    it('should_not_detect_expired_token_when_still_valid', () => {
      // Arrange
      const validToken: VerificationToken = {
        token: 'valid123',
        type: 'email_verification',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };

      // Act
      const result = emailVerificationService.isTokenExpired(validToken);

      // Assert
      expect(result).toBe(false);
    });

    it('should_return_failure_for_any_token_when_auth_disabled', async () => {
      // Act
      const result = await emailVerificationService.verifyEmailToken('any_token');

      // Assert - Auth disabled, all verifications fail gracefully
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // MARK: - Scenario: Token parsing and validation
  describe('when parsing verification tokens', () => {
    it('should_return_null_when_empty_token_given', () => {
      // Act
      const result = emailVerificationService.parseVerificationToken('');

      // Assert
      expect(result).toBeNull();
    });

    it('should_return_null_when_malformed_token_given', () => {
      // Arrange
      const malformedToken = 'not.a.valid.jwt.token.structure';

      // Act
      const result = emailVerificationService.parseVerificationToken(malformedToken);

      // Assert
      expect(result).toBeNull();
    });

    it('should_handle_tokens_without_expiration_date', () => {
      // Arrange
      const tokenWithoutExpiry: VerificationToken = {
        token: 'no_expiry_token',
        type: 'email_verification',
        // No expiresAt property
      };

      // Act
      const result = emailVerificationService.isTokenExpired(tokenWithoutExpiry);

      // Assert
      expect(result).toBe(false);
    });

    it('should_preserve_original_token_string_when_parsing', () => {
      // Arrange
      const originalToken = 'preserve_this_exact_string_123';

      // Act
      const result = emailVerificationService.parseVerificationToken(originalToken);

      // Assert
      expect(result?.token).toBe(originalToken);
    });
  });
});
