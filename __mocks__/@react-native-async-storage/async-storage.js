// __mocks__/@react-native-async-storage/async-storage.js

// Basic mock implementation for AsyncStorage based on Jest documentation
// https://react-native-async-storage.github.io/async-storage/docs/advanced/jest/

let store = {};

const asyncStorageMock = {
	setItem: jest.fn((key, value) => {
		return new Promise((resolve) => {
			store[key] = value;
			resolve(null);
		});
	}),
	getItem: jest.fn((key) => {
		return new Promise((resolve) => {
			resolve(store[key] || null);
		});
	}),
	removeItem: jest.fn((key) => {
		return new Promise((resolve) => {
			delete store[key];
			resolve(null);
		});
	}),
	clear: jest.fn(() => {
		return new Promise((resolve) => {
			store = {};
			resolve(null);
		});
	}),
	getAllKeys: jest.fn(() => {
		return new Promise((resolve) => {
			resolve(Object.keys(store));
		});
	}),
	multiGet: jest.fn((keys) => {
		return new Promise((resolve) => {
			const result = keys.map((key) => [key, store[key] || null]);
			resolve(result);
		});
	}),
	multiSet: jest.fn((keyValuePairs) => {
		return new Promise((resolve) => {
			keyValuePairs.forEach(([key, value]) => {
				store[key] = value;
			});
			resolve(null);
		});
	}),
	multiRemove: jest.fn((keys) => {
		return new Promise((resolve) => {
			keys.forEach((key) => {
				delete store[key];
			});
			resolve(null);
		});
	}),
	// Add multiMerge if needed by your code, otherwise basic mock is fine
	multiMerge: jest.fn((keyValuePairs) => {
		return new Promise((resolve, reject) => {
			// Basic merge logic (simple overwrite for mock)
			keyValuePairs.forEach(([key, value]) => {
				// A real merge might involve JSON parsing and merging objects
				store[key] = value;
			});
			resolve(null);
		});
	}),

	// Helper to reset the store between tests
	__INTERNAL_MOCK_STORAGE__: store,
	__INTERNAL_RESET_MOCK_STORAGE__: () => {
		store = {};
	},
};

export default asyncStorageMock;
