import React from "react";

// Mock implementation for nativewind
const styled = (Component: any) => Component;

const useColorScheme = () => "light";

export { styled, useColorScheme };

// Adding a test to prevent Jest from complaining
describe('Mock NativeWind', () => {
  test('styled function returns the component unchanged', () => {
    const TestComponent = () => null;
    expect(styled(TestComponent)).toBe(TestComponent);
  });

  test('useColorScheme returns light', () => {
    expect(useColorScheme()).toBe('light');
  });
}); 