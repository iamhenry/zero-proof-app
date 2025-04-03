import { renderHook, act } from '@testing-library/react-hooks';
import { useFinancialSettings } from '../hooks/useFinancialSettings'; // Import the actual hook
import { ISobrietyDataRepository } from '../../../../lib/types/repositories'; // Use correct path
import { useRepository } from '@/context/RepositoryContext';
import { createTestWrapper } from '@/lib/test-utils'; // Import the wrapper utility

// --- Mock Implementation (used by wrapper) ---
// Note: TimerStateContext is also provided by the wrapper but not used here.
const mockRepository: jest.Mocked<ISobrietyDataRepository> = {
  loadAllDayStatus: jest.fn(),
  loadDayStatus: jest.fn(),
  saveDayStatus: jest.fn(),
  loadStreakData: jest.fn(),
  saveStreakData: jest.fn(),
  loadTimerState: jest.fn(),
  saveTimerState: jest.fn(),
  loadDrinkCost: jest.fn(), // Mock the specific methods used by the hook
  saveDrinkCost: jest.fn(),
};
// --- End Mock Implementation ---


describe('Financial Settings Persistence (useFinancialSettings)', () => {
  // Note: The hook uses 'drinkCost' internally, but exposes 'drinkQuantity'
  const defaultCost = null;

  beforeEach(() => {
    jest.clearAllMocks();
    // No need to mock context hook return value here, wrapper handles it.

    // Default mock implementations for repository methods
    mockRepository.loadDrinkCost.mockResolvedValue(defaultCost);
    mockRepository.saveDrinkCost.mockResolvedValue();
  });

  // MARK: - Scenario: Persisting the drink quantity locally - BDD Scenario 2

  test('testSaveSettings_ShouldCallSaveDrinkCost', async () => {
    // Arrange
    const newQuantity = 5; // User input corresponds to 'drinkQuantity' exposed by hook
    const { result } = renderHook(() => useFinancialSettings(), {
        wrapper: createTestWrapper({ repositoryValue: mockRepository }) // Provide repo mock
    });

    // Wait for initial load to complete
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simulate user input changing the state within the hook via exposed setter
    act(() => {
        result.current.setDrinkQuantity(newQuantity);
    });

    mockRepository.saveDrinkCost.mockClear(); // Clear any potential previous calls

    // Act: Simulate saving the settings using the hook's function
    await act(async () => {
        result.current.saveSettings();
    });

    // Assert: Check if saveDrinkCost was called with the new quantity/cost
    expect(mockRepository.saveDrinkCost).toHaveBeenCalledTimes(1);
    // The hook internally saves the 'drinkCost' state, which was set via 'setDrinkQuantity'
    expect(mockRepository.saveDrinkCost).toHaveBeenCalledWith(newQuantity);
  });

  // MARK: - Scenario: Loading the saved drink quantity - BDD Scenario 3 & 4

  test('testInitialLoad_ShouldCallLoadDrinkCost', async () => {
    // Arrange
    mockRepository.loadDrinkCost.mockClear();

    // Act: Render the hook
    renderHook(() => useFinancialSettings(), {
        wrapper: createTestWrapper({ repositoryValue: mockRepository }) // Provide repo mock
    });

    // Assert: Check if loadDrinkCost was called during initialization
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for useEffect
    });
    expect(mockRepository.loadDrinkCost).toHaveBeenCalledTimes(1);
  });

  test('testInitialLoad_WhenSettingsExist_ShouldInitializeState', async () => {
    // Arrange: Define persisted settings (cost)
    const persistedCost = 10;
    mockRepository.loadDrinkCost.mockResolvedValue(persistedCost);

    // Act: Render the hook
    const { result } = renderHook(() => useFinancialSettings(), {
        wrapper: createTestWrapper({ repositoryValue: mockRepository }) // Provide repo mock
    });

    // Assert: Verify the hook's state reflects the loaded settings
    await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for useEffect
    });
    // Check the state exposed as 'drinkQuantity'
    expect(result.current.drinkQuantity).toBe(persistedCost);
  });

});