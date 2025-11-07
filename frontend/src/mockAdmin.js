// Mock data for admin panel

export const mockAdmin = {
  email: 'admin@smartflags.com',
  password: 'admin123',
  name: 'Admin User',
  id: 'admin-1'
};

export const mockOrganisations = [
  {
    id: 'org-1',
    name: 'Paradise Resorts Group',
    email: 'contact@paradiseresorts.com',
    phone: '+1 555 100 0001',
    address: '123 Resort Boulevard, Miami, FL 33139',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'org-2',
    name: 'Azure Hospitality',
    email: 'info@azurehospitality.com',
    phone: '+1 555 200 0002',
    address: '456 Ocean Drive, Maldives',
    createdAt: '2024-02-20T11:30:00Z'
  },
  {
    id: 'org-3',
    name: 'Sunset Beach Club',
    email: 'contact@sunsetbeach.com',
    phone: '+1 555 300 0003',
    address: '789 Coastal Highway, California 90210',
    createdAt: '2024-03-10T09:15:00Z'
  }
];

export const mockProperties = [
  {
    id: 'prop-1',
    organisationId: 'org-1',
    name: 'Paradise Beach Resort',
    email: 'beach@paradiseresorts.com',
    phone: '+1 555 100 1001',
    address: '789 Beach Road, Miami Beach, FL 33140',
    countryId: 'country-1',
    stateId: 'state-2',
    cityId: 'city-3',
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'prop-2',
    organisationId: 'org-1',
    name: 'Paradise Pool Club',
    email: 'pool@paradiseresorts.com',
    phone: '+1 555 100 1002',
    address: '321 Poolside Ave, Miami, FL 33141',
    countryId: 'country-1',
    stateId: 'state-2',
    cityId: 'city-3',
    createdAt: '2024-01-17T10:00:00Z'
  },
  {
    id: 'prop-3',
    organisationId: 'org-2',
    name: 'Azure Bay Resort',
    email: 'bay@azurehospitality.com',
    phone: '+1 555 200 2001',
    address: '456 Azure Bay, Maldives',
    countryId: 'country-5',
    stateId: '',
    cityId: '',
    createdAt: '2024-02-21T11:30:00Z'
  },
  {
    id: 'prop-4',
    organisationId: 'org-3',
    name: 'Sunset Beach Main',
    email: 'main@sunsetbeach.com',
    phone: '+1 555 300 3001',
    address: '789 Sunset Boulevard, California 90211',
    countryId: 'country-1',
    stateId: 'state-1',
    cityId: 'city-1',
    createdAt: '2024-03-11T09:15:00Z'
  }
];

// Master Data - Countries
export const mockCountries = [
  {
    id: 'country-1',
    name: 'United States',
    code: 'US',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country-2',
    name: 'United Kingdom',
    code: 'GB',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country-3',
    name: 'India',
    code: 'IN',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country-4',
    name: 'Australia',
    code: 'AU',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'country-5',
    name: 'Maldives',
    code: 'MV',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Master Data - States
export const mockStates = [
  {
    id: 'state-1',
    name: 'California',
    countryId: 'country-1',
    code: 'CA',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'state-2',
    name: 'Florida',
    countryId: 'country-1',
    code: 'FL',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'state-3',
    name: 'New York',
    countryId: 'country-1',
    code: 'NY',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'state-4',
    name: 'Maharashtra',
    countryId: 'country-3',
    code: 'MH',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'state-5',
    name: 'Karnataka',
    countryId: 'country-3',
    code: 'KA',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Master Data - Cities
export const mockCities = [
  {
    id: 'city-1',
    name: 'Los Angeles',
    stateId: 'state-1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'city-2',
    name: 'San Francisco',
    stateId: 'state-1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'city-3',
    name: 'Miami',
    stateId: 'state-2',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'city-4',
    name: 'Orlando',
    stateId: 'state-2',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'city-5',
    name: 'New York City',
    stateId: 'state-3',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'city-6',
    name: 'Mumbai',
    stateId: 'state-4',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'city-7',
    name: 'Bangalore',
    stateId: 'state-5',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

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