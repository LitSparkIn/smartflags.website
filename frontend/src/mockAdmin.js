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
export const mockCountries = [
  {
    id: 'country-1',
    name: 'United States',
    code: 'US',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'country-2',
    name: 'United Kingdom',
    code: 'UK',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'country-3',
    name: 'Australia',
    code: 'AU',
    createdAt: new Date('2024-01-01').toISOString()
  }
];

// Master Data - States
export const mockStates = [
  {
    id: 'state-1',
    name: 'Florida',
    countryId: 'country-1',
    code: 'FL',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'state-2',
    name: 'California',
    countryId: 'country-1',
    code: 'CA',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'state-3',
    name: 'New York',
    countryId: 'country-1',
    code: 'NY',
    createdAt: new Date('2024-01-01').toISOString()
  }
];

// Master Data - Cities
export const mockCities = [
  {
    id: 'city-1',
    name: 'Miami',
    stateId: 'state-1',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'city-2',
    name: 'Los Angeles',
    stateId: 'state-2',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'city-3',
    name: 'San Francisco',
    stateId: 'state-2',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 'city-4',
    name: 'New York City',
    stateId: 'state-3',
    createdAt: new Date('2024-01-01').toISOString()
  }
];

// Master Data - Roles
export const mockRoles = [
  {
    id: 'role-1',
    name: 'Org Admin',
    description: 'Will be able to see an org, all properties under it and all the reporting later on.',
    permissions: ['org.view', 'org.edit', 'properties.view', 'properties.manage', 'reports.view', 'users.manage'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'role-2',
    name: 'Property Admin',
    description: 'Will be able to see all the details of the associated property.',
    permissions: ['property.view', 'property.edit', 'staff.view', 'reports.view'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'role-3',
    name: 'Pool and Beach Manager',
    description: 'Will be able to manage Pool and Beach Attendants of the associated property.',
    permissions: ['pool.manage', 'beach.manage', 'attendants.manage', 'attendants.view'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'role-4',
    name: 'Food and Beverage Manager',
    description: 'Will be able to manage Servers of the associated property.',
    permissions: ['fnb.manage', 'servers.manage', 'servers.view', 'orders.view'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'role-5',
    name: 'Pool and Beach Attendants',
    description: 'Will be able to view Guest Dashboard',
    permissions: ['guest.dashboard.view', 'calls.view', 'calls.respond'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'role-6',
    name: 'Servers',
    description: 'Will be able to view Guest Dashboard',
    permissions: ['guest.dashboard.view', 'orders.view', 'orders.respond'],
    createdAt: new Date().toISOString()
  }
];

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