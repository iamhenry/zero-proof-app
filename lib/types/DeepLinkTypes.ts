/**
 * FILE: lib/types/DeepLinkTypes.ts
 * PURPOSE: Type definitions for deep link processing and email verification
 * KEY TYPES:
 *   - DeepLinkData: Interface for parsed deep link URL data with type, params, fragments, and error handling
 *   - DeepLinkType: Union type defining supported deep link types ('verification' | 'reset-password' | 'unknown')
 *   - VerificationResult: Interface for email verification attempt results with success status and optional error data
 *   - VerificationToken: Interface for verification token metadata including token string, type, expiration, and email
 *   - DeepLinkConfig: Interface for deep link URL scheme configuration with app scheme and supported path handlers
 * DEPENDENCIES: None
 */

/**
 * Represents parsed data from a deep link URL
 */
export interface DeepLinkData {
  /** The type of deep link (e.g., 'verification', 'reset-password') */
  type: DeepLinkType;
  /** Parameters extracted from the URL query string */
  params: Record<string, string>;
  /** URL fragments containing error information from Supabase */
  fragments: Record<string, string>;
  /** The original URL that was processed */
  originalUrl: string;
  /** Error message if parsing failed */
  error?: string;
}

/**
 * Types of deep links supported by the application
 */
export type DeepLinkType = 'verification' | 'reset-password' | 'unknown';

/**
 * Result of an email verification attempt
 */
export interface VerificationResult {
  /** Whether the verification was successful */
  success: boolean;
  /** Error message if verification failed */
  error?: string;
  /** Additional data from the verification process */
  data?: {
    userId?: string;
    email?: string;
    verified?: boolean;
  };
}

/**
 * Represents a verification token with metadata
 */
export interface VerificationToken {
  /** The actual token string */
  token: string;
  /** Token type (email verification, password reset, etc.) */
  type: 'email_verification' | 'password_reset';
  /** When the token expires (if available) */
  expiresAt?: Date;
  /** Associated email address */
  email?: string;
  /** Error message if token parsing/validation failed */
  error?: string;
}

/**
 * Configuration for deep link URL schemes
 */
export interface DeepLinkConfig {
  /** The app's URL scheme (e.g., 'zeroproof') */
  scheme: string;
  /** Supported paths and their handlers */
  paths: {
    verification: string;
    resetPassword: string;
  };
}