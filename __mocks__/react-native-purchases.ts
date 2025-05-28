// __mocks__/react-native-purchases.ts
// Manual Jest mock so that importing `react-native-purchases` never reaches the
// native module layer during testing.  All methods are jest.fn stubs that can
// be configured per-test.

const purchases = {
  configure: jest.fn(),
  setLogLevel: jest.fn(),
  getCustomerInfo: jest.fn(),
  getOfferings: jest.fn(),
  logIn: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
};

export const LOG_LEVEL = { INFO: "INFO", DEBUG: "DEBUG" } as const;

module.exports = {
  __esModule: true,
  ...purchases,
  default: purchases,
  LOG_LEVEL,
};
