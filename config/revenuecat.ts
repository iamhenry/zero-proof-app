/**
 * FILE: config/revenuecat.ts
 * PURPOSE: RevenueCat SDK configuration and helper functions for in-app purchases
 * FUNCTIONS:
 *   - configureRevenueCat() → void: Initialize RevenueCat SDK with API key
 *   - verifyRevenueCatSetup() → boolean: Verify SDK is properly configured
 *   - identifyUser(userId: string) → void: Associate user with RevenueCat
 *   - getCustomerInfo() → CustomerInfo: Get current user's subscription status
 *   - getOfferings() → Offerings: Get available subscription packages
 *   - makePurchase(packageToPurchase: any) → CustomerInfo: Process a purchase
 *   - restorePurchases() → CustomerInfo: Restore previous purchases
 * DEPENDENCIES: react-native-purchases, react-native Platform
 */

import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

const revenueCatApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY as string;

export const configureRevenueCat = async (): Promise<boolean> => {
  try {
    console.log('🚀 Starting RevenueCat SDK configuration...');
    
    // Validate API key exists
    if (!revenueCatApiKey) {
      throw new Error('RevenueCat API key is not configured. Please set EXPO_PUBLIC_REVENUECAT_API_KEY in your environment variables.');
    }
    
    console.log(`📱 Platform: ${Platform.OS}`);
    console.log('🔑 API key found (length:', revenueCatApiKey.length, 'characters)');

    // Configure RevenueCat SDK
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: revenueCatApiKey });
      console.log('✅ RevenueCat configured for iOS');
    } else if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: revenueCatApiKey });
      console.log('✅ RevenueCat configured for Android');
      // For Amazon Appstore, use: await Purchases.configure({ apiKey: revenueCatApiKey, useAmazon: true });
    } else {
      console.warn('⚠️ Unsupported platform for RevenueCat:', Platform.OS);
    }

    // Set log level for debugging (adjust for production)
    Purchases.setLogLevel(LOG_LEVEL.INFO);
    console.log('📝 RevenueCat log level set to INFO');

    // Verify configuration by testing basic functionality
    await verifyRevenueCatSetup();
    
    console.log('🎉 RevenueCat SDK configured and verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to configure RevenueCat:', error);
    return false;
  }
};

// Helper function to verify RevenueCat setup
export const verifyRevenueCatSetup = async (): Promise<boolean> => {
  try {
    console.log('🔍 Verifying RevenueCat setup...');
    
    // Test 1: Get customer info (basic SDK functionality)
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('✅ Customer info retrieved successfully');
    console.log('👤 User ID:', customerInfo.originalAppUserId);
    console.log('📅 First seen:', customerInfo.firstSeen);
    
    // Test 2: Get offerings (tests connection to RevenueCat dashboard)
    const offerings = await Purchases.getOfferings();
    console.log('✅ Offerings retrieved successfully');
    console.log('📦 Available offerings:', Object.keys(offerings.all).length);
    
    if (offerings.current) {
      console.log('🎯 Current offering:', offerings.current.identifier);
      console.log('📋 Available packages:', offerings.current.availablePackages.length);
    } else {
      console.warn('⚠️ No current offering found - check RevenueCat dashboard configuration');
    }
    
    return true;
  } catch (error) {
    console.error('❌ RevenueCat setup verification failed:', error);
    return false;
  }
};

// Helper function to identify user
export const identifyUser = async (userId: string) => {
  try {
    await Purchases.logIn(userId);
    console.log('User identified in RevenueCat:', userId);
  } catch (error) {
    console.error('Failed to identify user in RevenueCat:', error);
    throw error;
  }
};

// Helper function to get customer info
export const getCustomerInfo = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    throw error;
  }
};

// Helper function to get offerings
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    throw error;
  }
};

// Helper function to make a purchase
export const makePurchase = async (packageToPurchase: any) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error) {
    console.error('Failed to make purchase:', error);
    throw error;
  }
};

// Helper function to restore purchases
export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

// Export the Purchases instance for direct access if needed
export { Purchases }; 