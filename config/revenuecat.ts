/**
 * FILE: config/revenuecat.ts
 * PURPOSE: RevenueCat SDK configuration and helper functions for in-app purchases
 * FUNCTIONS:
 *   - configureRevenueCat() → void: Initialize RevenueCat SDK with API key
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

export const configureRevenueCat = async () => {
  try {
    // Configure RevenueCat SDK
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: revenueCatApiKey });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: revenueCatApiKey });
      // For Amazon Appstore, use: await Purchases.configure({ apiKey: revenueCatApiKey, useAmazon: true });
    }

    // Set log level for debugging (adjust for production)
    Purchases.setLogLevel(LOG_LEVEL.INFO);

    console.log('RevenueCat configured successfully');
  } catch (error) {
    console.error('Failed to configure RevenueCat:', error);
    throw error;
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