// Mock data storage utility using localStorage for persistence

const STORAGE_KEYS = {
  organisations: 'smartflags_mock_organisations',
  properties: 'smartflags_mock_properties',
  countries: 'smartflags_mock_countries',
  states: 'smartflags_mock_states',
  cities: 'smartflags_mock_cities',
  roles: 'smartflags_mock_roles'
};

// Get data from localStorage or return default
export const getMockData = (key, defaultData) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS[key]);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default data
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(defaultData));
    return defaultData;
  } catch (error) {
    console.error('Error reading mock data:', error);
    return defaultData;
  }
};

// Save data to localStorage
export const saveMockData = (key, data) => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving mock data:', error);
    return false;
  }
};

// Clear all mock data
export const clearAllMockData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
