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
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'prop-2',
    organisationId: 'org-1',
    name: 'Paradise Pool Club',
    email: 'pool@paradiseresorts.com',
    phone: '+1 555 100 1002',
    address: '321 Poolside Ave, Miami, FL 33141',
    createdAt: '2024-01-17T10:00:00Z'
  },
  {
    id: 'prop-3',
    organisationId: 'org-2',
    name: 'Azure Bay Resort',
    email: 'bay@azurehospitality.com',
    phone: '+1 555 200 2001',
    address: '456 Azure Bay, Maldives',
    createdAt: '2024-02-21T11:30:00Z'
  },
  {
    id: 'prop-4',
    organisationId: 'org-3',
    name: 'Sunset Beach Main',
    email: 'main@sunsetbeach.com',
    phone: '+1 555 300 3001',
    address: '789 Sunset Boulevard, California 90211',
    createdAt: '2024-03-11T09:15:00Z'
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