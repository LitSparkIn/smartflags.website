// Mock data for admin panel

export const mockAdmin = {
  email: 'admin@smartflags.com',
  password: 'admin123',
  name: 'Admin User',
  id: 'admin-1'
};

export const mockOrganisations = [];

export const mockProperties = [];

// Master Data - Countries
export const mockCountries = [];

// Master Data - States
export const mockStates = [];

// Master Data - Cities
export const mockCities = [];

// Master Data - Roles
export const mockRoles = [];

// Helper functions that read from localStorage
const getStoredData = (key, defaultValue) => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Helper function to get organisation by ID
export const getOrganisationById = (id) => {
  const orgs = getStoredData('smartflags_organisations', mockOrganisations);
  return orgs.find(org => org.id === id);
};

// Helper function to get properties by organisation ID
export const getPropertiesByOrganisation = (orgId) => {
  const props = getStoredData('smartflags_properties', mockProperties);
  return props.filter(prop => prop.organisationId === orgId);
};

// Helper function to get country by ID
export const getCountryById = (id) => {
  const countries = getStoredData('smartflags_countries', mockCountries);
  return countries.find(country => country.id === id);
};

// Helper function to get state by ID
export const getStateById = (id) => {
  const states = getStoredData('smartflags_states', mockStates);
  return states.find(state => state.id === id);
};

// Helper function to get states by country ID
export const getStatesByCountry = (countryId) => {
  const states = getStoredData('smartflags_states', mockStates);
  return states.filter(state => state.countryId === countryId);
};

// Helper function to get cities by state ID
export const getCitiesByState = (stateId) => {
  const cities = getStoredData('smartflags_cities', mockCities);
  return cities.filter(city => city.stateId === stateId);
};