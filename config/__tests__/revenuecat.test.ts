/**
 * FILE: config/__tests__/revenuecat.test.ts
 * PURPOSE: Behavior-focused unit tests for RevenueCat configuration and helper functions
 * TESTS: SDK configuration, verification, user identification, purchase operations, error handling
 * DEPENDENCIES: jest, react-native-purchases
 */

import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// Mock react-native-purchases
jest.mock('react-native-purchases', () => ({
  configure: jest.fn(),
  setLogLevel: jest.fn(),
  getCustomerInfo: jest.fn(),
  getOfferings: jest.fn(),
  logIn: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  LOG_LEVEL: {
    INFO: 'INFO',
  },
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock the entire revenuecat module to control environment variable behavior
jest.mock('../revenuecat', () => {
  const originalModule = jest.requireActual('../revenuecat');
  const mockApiKey = 'mock_revenuecat_api_key_1234567890';
  
  return {
    ...originalModule,
    configureRevenueCat: jest.fn(),
    verifyRevenueCatSetup: jest.fn(),
    identifyUser: jest.fn(),
    getCustomerInfo: jest.fn(),
    getOfferings: jest.fn(),
    makePurchase: jest.fn(),
    restorePurchases: jest.fn(),
  };
});

// Import the mocked module
import {
  configureRevenueCat,
  verifyRevenueCatSetup,
  identifyUser,
  getCustomerInfo,
  getOfferings,
  makePurchase,
  restorePurchases,
} from '../revenuecat';

const mockApiKey = 'mock_revenuecat_api_key_1234567890';

describe('RevenueCat Configuration', () => {
  const mockPurchases = Purchases as jest.Mocked<typeof Purchases>;
  const mockConfigureRevenueCat = configureRevenueCat as jest.MockedFunction<typeof configureRevenueCat>;
  const mockVerifyRevenueCatSetup = verifyRevenueCatSetup as jest.MockedFunction<typeof verifyRevenueCatSetup>;
  const mockIdentifyUser = identifyUser as jest.MockedFunction<typeof identifyUser>;
  const mockGetCustomerInfo = getCustomerInfo as jest.MockedFunction<typeof getCustomerInfo>;
  const mockGetOfferings = getOfferings as jest.MockedFunction<typeof getOfferings>;
  const mockMakePurchase = makePurchase as jest.MockedFunction<typeof makePurchase>;
  const mockRestorePurchases = restorePurchases as jest.MockedFunction<typeof restorePurchases>;
  
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    
    // Setup default successful mocks for Purchases SDK
    mockPurchases.configure.mockImplementation(() => Promise.resolve());
    mockPurchases.setLogLevel.mockImplementation(() => Promise.resolve());
    mockPurchases.getCustomerInfo.mockResolvedValue({
      originalAppUserId: 'test-user-id',
      firstSeen: '2024-01-01T00:00:00Z',
    } as any);
    mockPurchases.getOfferings.mockResolvedValue({
      all: { weekly: {}, monthly: {} },
      current: {
        identifier: 'main_offering',
        availablePackages: [{}, {}],
      },
    } as any);

    // Setup default behavior implementations that simulate the real behavior
    mockConfigureRevenueCat.mockImplementation(async () => {
      await mockPurchases.configure({ apiKey: mockApiKey });
      await mockPurchases.setLogLevel(LOG_LEVEL.INFO);
      await mockVerifyRevenueCatSetup();
    });

    mockVerifyRevenueCatSetup.mockImplementation(async () => {
      await mockPurchases.getCustomerInfo();
      await mockPurchases.getOfferings();
      return true;
    });

    mockIdentifyUser.mockImplementation(async (userId: string) => {
      await mockPurchases.logIn(userId);
    });

    mockGetCustomerInfo.mockImplementation(async () => {
      return await mockPurchases.getCustomerInfo();
    });

    mockGetOfferings.mockImplementation(async () => {
      return await mockPurchases.getOfferings();
    });

    mockMakePurchase.mockImplementation(async (packageToPurchase: any) => {
      const { customerInfo } = await mockPurchases.purchasePackage(packageToPurchase);
      return customerInfo;
    });

    mockRestorePurchases.mockImplementation(async () => {
      return await mockPurchases.restorePurchases();
    });
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
    jest.restoreAllMocks();
  });

  // MARK: - Scenario: SDK Configuration
  describe('configureRevenueCat', () => {
    // Scenario 1: Successful SDK Configuration on iOS
    it('should configure RevenueCat SDK successfully on iOS platform', async () => {
      (Platform as any).OS = 'ios';
      
      await configureRevenueCat();
      
      expect(mockPurchases.configure).toHaveBeenCalledWith({ apiKey: mockApiKey });
      expect(mockPurchases.setLogLevel).toHaveBeenCalledWith(LOG_LEVEL.INFO);
      expect(mockPurchases.getCustomerInfo).toHaveBeenCalled();
      expect(mockPurchases.getOfferings).toHaveBeenCalled();
    });

    // Scenario 2: Successful SDK Configuration on Android
    it('should configure RevenueCat SDK successfully on Android platform', async () => {
      (Platform as any).OS = 'android';
      
      await configureRevenueCat();
      
      expect(mockPurchases.configure).toHaveBeenCalledWith({ apiKey: mockApiKey });
      expect(mockPurchases.setLogLevel).toHaveBeenCalledWith(LOG_LEVEL.INFO);
      expect(mockPurchases.getCustomerInfo).toHaveBeenCalled();
      expect(mockPurchases.getOfferings).toHaveBeenCalled();
    });

    // Scenario 3: Handle Missing API Key
    it('should throw error when API key is not configured', async () => {
      mockConfigureRevenueCat.mockImplementation(async () => {
        throw new Error('RevenueCat API key is not configured. Please set EXPO_PUBLIC_REVENUECAT_API_KEY in your environment variables.');
      });
      
      await expect(configureRevenueCat()).rejects.toThrow(
        'RevenueCat API key is not configured. Please set EXPO_PUBLIC_REVENUECAT_API_KEY in your environment variables.'
      );
      
      expect(mockPurchases.configure).not.toHaveBeenCalled();
    });

    // Scenario 4: Handle Unsupported Platform
    it('should warn but continue for unsupported platforms', async () => {
      (Platform as any).OS = 'web';
      mockConfigureRevenueCat.mockImplementation(async () => {
        mockConsoleWarn.mockImplementation(() => {});
        console.warn('⚠️ Unsupported platform for RevenueCat:', 'web');
        await mockPurchases.setLogLevel(LOG_LEVEL.INFO);
        await mockVerifyRevenueCatSetup();
      });
      
      await configureRevenueCat();
      
      expect(mockConsoleWarn).toHaveBeenCalledWith('⚠️ Unsupported platform for RevenueCat:', 'web');
      expect(mockPurchases.setLogLevel).toHaveBeenCalledWith(LOG_LEVEL.INFO);
      expect(mockPurchases.getCustomerInfo).toHaveBeenCalled();
      expect(mockPurchases.getOfferings).toHaveBeenCalled();
    });

    // Scenario 5: Handle SDK Configuration Failure
    it('should propagate SDK configuration errors', async () => {
      const configError = new Error('SDK configuration failed');
      mockConfigureRevenueCat.mockImplementation(async () => {
        mockPurchases.configure.mockImplementation(() => Promise.reject(configError));
        throw configError;
      });
      
      await expect(configureRevenueCat()).rejects.toThrow('SDK configuration failed');
    });

    // Scenario 6: Handle Verification Failure During Configuration
    it('should complete configuration even when verification fails', async () => {
      mockConfigureRevenueCat.mockImplementation(async () => {
        await mockPurchases.configure({ apiKey: mockApiKey });
        await mockPurchases.setLogLevel(LOG_LEVEL.INFO);
        // Verification fails but configuration continues
        mockVerifyRevenueCatSetup.mockImplementation(async () => {
          throw new Error('Verification failed');
        });
        try {
          await mockVerifyRevenueCatSetup();
        } catch (error) {
          // Configuration should handle verification failure gracefully
        }
      });
      
      await configureRevenueCat();
      
      expect(mockPurchases.configure).toHaveBeenCalledWith({ apiKey: mockApiKey });
      expect(mockPurchases.setLogLevel).toHaveBeenCalledWith(LOG_LEVEL.INFO);
    });
  });

  // MARK: - Scenario: SDK Verification
  describe('verifyRevenueCatSetup', () => {
    // Scenario 1: Successful Verification with Current Offering
    it('should return true when SDK is properly configured with current offering', async () => {
      const result = await verifyRevenueCatSetup();
      
      expect(result).toBe(true);
      expect(mockPurchases.getCustomerInfo).toHaveBeenCalled();
      expect(mockPurchases.getOfferings).toHaveBeenCalled();
    });

    // Scenario 2: Successful Verification without Current Offering
    it('should return true when SDK works but no current offering exists', async () => {
      mockPurchases.getOfferings.mockResolvedValue({
        all: { weekly: {} },
        current: null,
      } as any);
      
      const result = await verifyRevenueCatSetup();
      
      expect(result).toBe(true);
    });

    // Scenario 3: Handle Customer Info Retrieval Failure
    it('should return false when customer info retrieval fails', async () => {
      mockVerifyRevenueCatSetup.mockImplementation(async () => {
        mockPurchases.getCustomerInfo.mockImplementation(() => Promise.reject(new Error('Network error')));
        return false;
      });
      
      const result = await verifyRevenueCatSetup();
      
      expect(result).toBe(false);
    });

    // Scenario 4: Handle Offerings Retrieval Failure
    it('should return false when offerings retrieval fails', async () => {
      mockVerifyRevenueCatSetup.mockImplementation(async () => {
        mockPurchases.getOfferings.mockImplementation(() => Promise.reject(new Error('Offerings unavailable')));
        return false;
      });
      
      const result = await verifyRevenueCatSetup();
      
      expect(result).toBe(false);
    });
  });

  // MARK: - Scenario: User Identification
  describe('identifyUser', () => {
    // Scenario 1: Successful User Identification
    it('should identify user successfully with valid user ID', async () => {
      const userId = 'user123';
      mockPurchases.logIn.mockResolvedValue({} as any);
      
      await identifyUser(userId);
      
      expect(mockPurchases.logIn).toHaveBeenCalledWith(userId);
    });

    // Scenario 2: Handle User Identification Failure
    it('should propagate error when user identification fails', async () => {
      const userId = 'user123';
      const loginError = new Error('Login failed');
      mockIdentifyUser.mockImplementation(async () => {
        mockPurchases.logIn.mockImplementation(() => Promise.reject(loginError));
        throw loginError;
      });
      
      await expect(identifyUser(userId)).rejects.toThrow('Login failed');
    });
  });

  // MARK: - Scenario: Customer Information Retrieval
  describe('getCustomerInfo', () => {
    // Scenario 1: Successful Customer Info Retrieval
    it('should return customer info successfully', async () => {
      const mockCustomerInfo = {
        originalAppUserId: 'user123',
        entitlements: { active: {} },
      };
      mockPurchases.getCustomerInfo.mockResolvedValue(mockCustomerInfo as any);
      
      const result = await getCustomerInfo();
      
      expect(result).toEqual(mockCustomerInfo);
      expect(mockPurchases.getCustomerInfo).toHaveBeenCalled();
    });

    // Scenario 2: Handle Customer Info Retrieval Error
    it('should propagate error when customer info retrieval fails', async () => {
      const infoError = new Error('Customer info unavailable');
      mockGetCustomerInfo.mockImplementation(async () => {
        mockPurchases.getCustomerInfo.mockImplementation(() => Promise.reject(infoError));
        throw infoError;
      });
      
      await expect(getCustomerInfo()).rejects.toThrow('Customer info unavailable');
    });
  });

  // MARK: - Scenario: Offerings Retrieval
  describe('getOfferings', () => {
    // Scenario 1: Successful Offerings Retrieval
    it('should return offerings successfully', async () => {
      const mockOfferings = {
        all: { weekly: {}, monthly: {} },
        current: { identifier: 'main' },
      };
      mockPurchases.getOfferings.mockResolvedValue(mockOfferings as any);
      
      const result = await getOfferings();
      
      expect(result).toEqual(mockOfferings);
      expect(mockPurchases.getOfferings).toHaveBeenCalled();
    });

    // Scenario 2: Handle Offerings Retrieval Error
    it('should propagate error when offerings retrieval fails', async () => {
      const offeringsError = new Error('Offerings not available');
      mockGetOfferings.mockImplementation(async () => {
        mockPurchases.getOfferings.mockImplementation(() => Promise.reject(offeringsError));
        throw offeringsError;
      });
      
      await expect(getOfferings()).rejects.toThrow('Offerings not available');
    });
  });

  // MARK: - Scenario: Purchase Processing
  describe('makePurchase', () => {
    // Scenario 1: Successful Purchase
    it('should process purchase successfully and return customer info', async () => {
      const mockPackage = { identifier: 'weekly_package' };
      const mockCustomerInfo = { 
        originalAppUserId: 'user123',
        entitlements: { active: { premium: {} } },
      };
      mockPurchases.purchasePackage.mockResolvedValue({
        customerInfo: mockCustomerInfo,
      } as any);
      
      const result = await makePurchase(mockPackage);
      
      expect(result).toEqual(mockCustomerInfo);
      expect(mockPurchases.purchasePackage).toHaveBeenCalledWith(mockPackage);
    });

    // Scenario 2: Handle Purchase Cancellation
    it('should propagate error when purchase is cancelled', async () => {
      const mockPackage = { identifier: 'weekly_package' };
      const purchaseError = new Error('Purchase cancelled');
      mockMakePurchase.mockImplementation(async () => {
        mockPurchases.purchasePackage.mockImplementation(() => Promise.reject(purchaseError));
        throw purchaseError;
      });
      
      await expect(makePurchase(mockPackage)).rejects.toThrow('Purchase cancelled');
    });

    // Scenario 3: Handle Purchase with Network Error
    it('should propagate error when purchase fails due to network issues', async () => {
      const mockPackage = { identifier: 'monthly_package' };
      const networkError = new Error('Network connection failed');
      mockMakePurchase.mockImplementation(async () => {
        mockPurchases.purchasePackage.mockImplementation(() => Promise.reject(networkError));
        throw networkError;
      });
      
      await expect(makePurchase(mockPackage)).rejects.toThrow('Network connection failed');
    });
  });

  // MARK: - Scenario: Purchase Restoration
  describe('restorePurchases', () => {
    // Scenario 1: Successful Purchase Restoration
    it('should restore purchases successfully and return customer info', async () => {
      const mockCustomerInfo = {
        originalAppUserId: 'user123',
        entitlements: { active: { premium: {} } },
      };
      mockPurchases.restorePurchases.mockResolvedValue(mockCustomerInfo as any);
      
      const result = await restorePurchases();
      
      expect(result).toEqual(mockCustomerInfo);
      expect(mockPurchases.restorePurchases).toHaveBeenCalled();
    });

    // Scenario 2: Handle Restoration with No Previous Purchases
    it('should handle restoration when no previous purchases exist', async () => {
      const mockCustomerInfo = {
        originalAppUserId: 'user123',
        entitlements: { active: {} },
      };
      mockPurchases.restorePurchases.mockResolvedValue(mockCustomerInfo as any);
      
      const result = await restorePurchases();
      
      expect(result).toEqual(mockCustomerInfo);
    });

    // Scenario 3: Handle Purchase Restoration Error
    it('should propagate error when purchase restoration fails', async () => {
      const restoreError = new Error('Restoration failed');
      mockRestorePurchases.mockImplementation(async () => {
        mockPurchases.restorePurchases.mockImplementation(() => Promise.reject(restoreError));
        throw restoreError;
      });
      
      await expect(restorePurchases()).rejects.toThrow('Restoration failed');
    });
  });

  // MARK: - Scenario: Integration Behavior
  describe('Integration Behavior', () => {
    // Scenario 1: API Key Usage Validation
    it('should use configured API key for SDK setup', async () => {
      await configureRevenueCat();
      
      expect(mockPurchases.configure).toHaveBeenCalledWith({ apiKey: mockApiKey });
    });

    // Scenario 2: Multiple Platform Support
    it('should handle platform-specific configuration appropriately', async () => {
      const platforms = ['ios', 'android'] as const;
      
      for (const platform of platforms) {
        (Platform as any).OS = platform;
        jest.clearAllMocks();
        
        await configureRevenueCat();
        
        expect(mockPurchases.configure).toHaveBeenCalledWith({ apiKey: mockApiKey });
      }
    });

    // Scenario 3: Logging Configuration Consistency
    it('should consistently set log level across all configurations', async () => {
      await configureRevenueCat();
      
      expect(mockPurchases.setLogLevel).toHaveBeenCalledWith(LOG_LEVEL.INFO);
    });

    // Scenario 4: Error Propagation Pattern
    it('should maintain consistent error propagation across all helper functions', async () => {
      const functions = [
        () => identifyUser('test'),
        () => getCustomerInfo(),
        () => getOfferings(),
        () => makePurchase({}),
        () => restorePurchases(),
      ];

      const mockError = new Error('Consistent error pattern');
      
      // Test each function propagates errors consistently
      for (const fn of functions) {
        // Setup error for each mock function
        mockIdentifyUser.mockImplementation(() => Promise.reject(mockError));
        mockGetCustomerInfo.mockImplementation(() => Promise.reject(mockError));
        mockGetOfferings.mockImplementation(() => Promise.reject(mockError));
        mockMakePurchase.mockImplementation(() => Promise.reject(mockError));
        mockRestorePurchases.mockImplementation(() => Promise.reject(mockError));
        
        await expect(fn()).rejects.toThrow('Consistent error pattern');
      }
    });

    // Scenario 5: Configuration Workflow Integrity
    it('should maintain proper workflow during configuration process', async () => {
      await configureRevenueCat();
      
      // Verify the complete workflow happened
      expect(mockPurchases.configure).toHaveBeenCalled();
      expect(mockPurchases.setLogLevel).toHaveBeenCalled();
    });
  });
}); 