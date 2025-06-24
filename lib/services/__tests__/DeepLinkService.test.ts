/**
 * FILE: lib/services/__tests__/DeepLinkService.test.ts
 * PURPOSE: Red Phase failing tests for DeepLinkService following TDD guidelines
 * SCOPE: Tests deep link URL parsing, handling, and listener management
 * DEPENDENCIES: Jest, React Native Linking, DeepLinkService SUT
 */

import { Linking } from 'react-native';
import { DeepLinkService } from '../DeepLinkService';
import { DeepLinkData, DeepLinkType } from '../../types/DeepLinkTypes';

// Mock React Native Linking with realistic data structures
jest.mock('react-native', () => ({
  Linking: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    getInitialURL: jest.fn(),
    canOpenURL: jest.fn(),
    openURL: jest.fn(),
  },
}));

// Mock router and toast hooks with realistic return values
const mockRouterPush = jest.fn();
const mockShowToast = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: jest.fn(),
  }),
}));

jest.mock('@/context/toast-provider', () => ({
  useToast: () => ({
    showToast: mockShowToast,
    hideToast: jest.fn(),
    clearToasts: jest.fn(),
  }),
}));

describe('DeepLinkService', () => {
  let deepLinkService: DeepLinkService;
  const mockLinking = Linking as jest.Mocked<typeof Linking>;

  beforeEach(() => {
    jest.clearAllMocks();
    deepLinkService = new DeepLinkService();
  });

  // MARK: - Scenario: Successful email verification via deep link
  describe('when handling verification deep links', () => {
    const validVerificationUrl = 'zeroproof://verify?token=abc123&type=email_verification';
    const expectedDeepLinkData: DeepLinkData = {
      type: 'verification' as DeepLinkType,
      params: { token: 'abc123', type: 'email_verification' },
      originalUrl: validVerificationUrl,
    };

    it('should_parse_verification_url_correctly_when_valid_url_given', () => {
      // Arrange
      const url = validVerificationUrl;

      // Act
      const result = deepLinkService.parseVerificationUrl(url);

      // Assert - Will fail because SUT stub returns null
      expect(result).toEqual(expectedDeepLinkData);
      expect(result?.type).toBe('verification');
      expect(result?.params.token).toBe('abc123');
    });

    it('should_handle_deep_link_successfully_when_verification_url_given', async () => {
      // Arrange
      const url = validVerificationUrl;

      // Act
      await deepLinkService.handleDeepLink(url);

      // Assert - Will fail because SUT stub returns undefined without calling dependencies
      expect(mockShowToast).toHaveBeenCalledWith(
        'Email verified successfully!',
        'success',
        5000
      );
      expect(mockRouterPush).toHaveBeenCalledWith('/(app)/welcome');
    });

    it('should_extract_token_parameter_when_verification_url_contains_token', () => {
      // Arrange
      const urlWithToken = 'zeroproof://verify?token=xyz789&email=test@example.com';

      // Act
      const result = deepLinkService.parseVerificationUrl(urlWithToken);

      // Assert - Will fail because SUT stub returns null
      expect(result?.params.token).toBe('xyz789');
      expect(result?.params.email).toBe('test@example.com');
    });
  });

  // MARK: - Scenario: Email verification with authentication error
  describe('when handling invalid verification links', () => {
    it('should_return_null_when_malformed_url_given', () => {
      // Arrange
      const malformedUrl = 'not-a-valid-url';

      // Act
      const result = deepLinkService.parseVerificationUrl(malformedUrl);

      // Assert - Will fail because SUT stub returns null for all inputs, not just invalid ones
      expect(result).toBeNull();
      // Force proper validation - SUT should differentiate between valid and invalid URLs
    });

    it('should_return_null_when_wrong_scheme_given', () => {
      // Arrange
      const wrongSchemeUrl = 'https://example.com/verify?token=abc123';

      // Act
      const result = deepLinkService.parseVerificationUrl(wrongSchemeUrl);

      // Assert - Will fail because SUT stub returns null for all inputs
      expect(result).toBeNull();
      // Force proper scheme validation - SUT should validate URL scheme
    });

    it('should_handle_error_gracefully_when_invalid_deep_link_given', async () => {
      // Arrange
      const invalidUrl = 'zeroproof://invalid-path';

      // Act
      await deepLinkService.handleDeepLink(invalidUrl);

      // Assert - Will fail because SUT stub doesn't implement error handling
      expect(mockShowToast).toHaveBeenCalledWith(
        'Verification failed. Please try again.',
        'error',
        5000
      );
    });
  });

  // MARK: - Scenario: Deep link when app is not already running
  describe('when managing deep link listeners', () => {
    it('should_register_listener_when_called', () => {
      // Act
      deepLinkService.registerDeepLinkListener();

      // Assert - Will fail because SUT stub doesn't call Linking.addEventListener
      expect(mockLinking.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));
    });

    it('should_unregister_listener_when_called', () => {
      // Arrange
      deepLinkService.registerDeepLinkListener();

      // Act
      deepLinkService.unregisterDeepLinkListener();

      // Assert - Will fail because SUT stub doesn't call Linking.removeEventListener
      expect(mockLinking.removeEventListener).toHaveBeenCalledWith('url', expect.any(Function));
    });

    it('should_handle_initial_url_when_app_launches_from_deep_link', async () => {
      // Arrange
      const initialUrl = 'zeroproof://verify?token=initial123';
      mockLinking.getInitialURL.mockResolvedValue(initialUrl);

      // Act
      deepLinkService.registerDeepLinkListener();
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow async operations

      // Assert - Will fail because SUT stub doesn't check for initial URL
      expect(mockLinking.getInitialURL).toHaveBeenCalled();
    });
  });

  // MARK: - Scenario: Deep link when app is already running
  describe('when app receives deep link while running', () => {
    it('should_process_incoming_url_when_app_is_foreground', async () => {
      // Arrange
      const incomingUrl = 'zeroproof://verify?token=foreground123';
      let urlListener: (event: { url: string }) => void;
      
      mockLinking.addEventListener.mockImplementation((event, callback) => {
        if (event === 'url') {
          urlListener = callback as (event: { url: string }) => void;
        }
      });

      // Act
      deepLinkService.registerDeepLinkListener();
      urlListener!({ url: incomingUrl });

      // Assert - Will fail because SUT stub doesn't process URL events
      expect(mockShowToast).toHaveBeenCalledWith(
        'Email verified successfully!',
        'success',
        5000
      );
    });

    it('should_maintain_app_stability_when_multiple_links_received', async () => {
      // Arrange
      const urls = [
        'zeroproof://verify?token=first123',
        'zeroproof://verify?token=second456',
        'zeroproof://verify?token=third789'
      ];

      // Act
      for (const url of urls) {
        await deepLinkService.handleDeepLink(url);
      }

      // Assert - Will fail because SUT stub doesn't implement proper handling
      expect(mockShowToast).toHaveBeenCalledTimes(3);
    });

    it('should_handle_concurrent_deep_links_without_conflicts', async () => {
      // Arrange
      const concurrentUrls = [
        'zeroproof://verify?token=concurrent1',
        'zeroproof://verify?token=concurrent2'
      ];

      // Act
      const promises = concurrentUrls.map(url => deepLinkService.handleDeepLink(url));
      await Promise.all(promises);

      // Assert - Will fail because SUT stub doesn't handle concurrent operations
      expect(mockShowToast).toHaveBeenCalledTimes(2);
    });
  });
});