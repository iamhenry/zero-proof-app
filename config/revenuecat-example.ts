/**
 * EXAMPLE: How to integrate RevenueCat into your app
 * 
 * This file shows how to use the RevenueCat configuration in your React Native app.
 * Follow these patterns to implement in-app purchases.
 */

import { useEffect, useState } from 'react';
import { PurchasesPackage } from 'react-native-purchases';
import { configureRevenueCat, getCustomerInfo, getOfferings, makePurchase, restorePurchases } from './revenuecat';

// Example: Initialize RevenueCat in your App.tsx (similar to how Supabase is initialized)
export const initializeRevenueCat = () => {
  // Call this early in your app lifecycle, similar to how supabase is configured
  configureRevenueCat();
};

// Example: Custom hook for subscription status
export const useSubscriptionStatus = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const customerInfo = await getCustomerInfo();
        // Check if user has active entitlements (replace 'premium' with your entitlement identifier)
        const hasActiveSubscription = customerInfo.entitlements.active['premium'] !== undefined;
        setIsSubscribed(hasActiveSubscription);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, []);

  return { isSubscribed, loading };
};

// Example: Custom hook for available packages
export const useRevenueCatOfferings = () => {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await getOfferings();
        if (offerings.current) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (error) {
        console.error('Error fetching offerings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, []);

  return { packages, loading };
};

// Example: Purchase handler
export const handlePurchase = async (packageToPurchase: any) => {
  try {
    const customerInfo = await makePurchase(packageToPurchase);
    console.log('Purchase successful:', customerInfo);
    return { success: true, customerInfo };
  } catch (error) {
    console.error('Purchase failed:', error);
    return { success: false, error };
  }
};

// Example: Restore purchases handler
export const handleRestorePurchases = async () => {
  try {
    const customerInfo = await restorePurchases();
    console.log('Purchases restored:', customerInfo);
    return { success: true, customerInfo };
  } catch (error) {
    console.error('Restore failed:', error);
    return { success: false, error };
  }
};

/*
INTEGRATION STEPS:

1. Add to your App.tsx (before your main component):
   import { initializeRevenueCat } from './config/revenuecat-example';
   initializeRevenueCat();

2. In your paywall component:
   import { useRevenueCatOfferings, handlePurchase } from './config/revenuecat-example';
   
   const { packages, loading } = useRevenueCatOfferings();
   
   const onPurchase = async (pkg) => {
     const result = await handlePurchase(pkg);
     if (result.success) {
       // Handle successful purchase
     }
   };

3. To check subscription status:
   import { useSubscriptionStatus } from './config/revenuecat-example';
   
   const { isSubscribed, loading } = useSubscriptionStatus();
   
   if (isSubscribed) {
     // Show premium content
   } else {
     // Show paywall
   }

4. Set your environment variable:
   EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_public_api_key_here
*/ 