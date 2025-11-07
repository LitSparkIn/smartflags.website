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
export const mockRoles = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    permissions: ['all'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role-2',
    name: 'Manager',
    description: 'Manage properties and staff within organisation',
    permissions: ['properties.view', 'properties.edit', 'staff.manage'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role-3',
    name: 'Staff',
    description: 'Handle guest requests and service calls',
    permissions: ['calls.view', 'calls.respond', 'orders.view'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'role-4',
    name: 'Viewer',
    description: 'Read-only access to dashboard and reports',
    permissions: ['dashboard.view', 'reports.view'],
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Helper function to get organisation by ID
export const getOrganisationById = (id) => {
  return mockOrganisations.find(org => org.id === id);
};

// Helper function to get properties by organisation ID
export const getPropertiesByOrganisation = (orgId) => {
  return mockProperties.filter(prop => prop.organisationId === orgId);
};

// Helper function to get country by ID
export const getCountryById = (id) => {
  return mockCountries.find(country => country.id === id);
};

// Helper function to get state by ID
export const getStateById = (id) => {
  return mockStates.find(state => state.id === id);
};

// Helper function to get states by country ID
export const getStatesByCountry = (countryId) => {
  return mockStates.filter(state => state.countryId === countryId);
};

// Helper function to get cities by state ID
export const getCitiesByState = (stateId) => {
  return mockCities.filter(city => city.stateId === stateId);
};