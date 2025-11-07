import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { getStatesByCountry, getCitiesByState } from '../../mockAdmin';

export const PropertyDialog = ({ open, onOpenChange, property, onSave }) => {
  const [formData, setFormData] = useState({
    organisationId: '',
    name: '',
    email: '',
    phoneCountryCode: '',
    phone: '',
    address: '',
    countryId: '',
    stateId: '',
    cityId: ''
  });

  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [countries, setCountries] = useState([]);

  // Load organisations and countries when dialog opens
  useEffect(() => {
    if (open) {
      try {
        const storedOrgs = localStorage.getItem('smartflags_organisations');
        const storedCountries = localStorage.getItem('smartflags_countries');
        setOrganisations(storedOrgs ? JSON.parse(storedOrgs) : []);
        setCountries(storedCountries ? JSON.parse(storedCountries) : []);
      } catch (error) {
        setOrganisations([]);
        setCountries([]);
      }
    }
  }, [open]);

  useEffect(() => {
    if (property) {
      setFormData({
        organisationId: property.organisationId || '',
        name: property.name || '',
        email: property.email || '',
        phoneCountryCode: property.phoneCountryCode || '',
        phone: property.phone || '',
        address: property.address || '',
        countryId: property.countryId || '',
        stateId: property.stateId || '',
        cityId: property.cityId || ''
      });
      
      // Load states and cities for existing property
      if (property.countryId) {
        setAvailableStates(getStatesByCountry(property.countryId));
      }
      if (property.stateId) {
        setAvailableCities(getCitiesByState(property.stateId));
      }
    } else {
      setFormData({
        organisationId: '',
        name: '',
        email: '',
        phoneCountryCode: '',
        phone: '',
        address: '',
        countryId: '',
        stateId: '',
        cityId: ''
      });
      setAvailableStates([]);
      setAvailableCities([]);
    }
  }, [property, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOrganisationChange = (value) => {
    setFormData({
      ...formData,
      organisationId: value
    });
  };

  const handleCountryChange = (value) => {
    const states = getStatesByCountry(value);
    setAvailableStates(states);
    setAvailableCities([]);
    setFormData({
      ...formData,
      countryId: value,
      stateId: '',
      cityId: ''
    });
  };

  const handleStateChange = (value) => {
    const cities = getCitiesByState(value);
    setAvailableCities(cities);
    setFormData({
      ...formData,
      stateId: value,
      cityId: ''
    });
  };

  const handleCityChange = (value) => {
    setFormData({
      ...formData,
      cityId: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {property ? 'Edit Property' : 'Create Property'}
          </DialogTitle>
          <DialogDescription>
            {property
              ? 'Update the property details below.'
              : 'Fill in the details to create a new property.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Organisation Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="organisationId">Organisation *</Label>
              <Select
                value={formData.organisationId}
                onValueChange={handleOrganisationChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an organisation" />
                </SelectTrigger>
                <SelectContent>
                  {organisations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Paradise Beach Resort"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="property@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.phoneCountryCode}
                  onValueChange={(value) => setFormData({ ...formData, phoneCountryCode: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCountries.map((country) => (
                      <SelectItem key={country.id} value={country.code}>
                        {country.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="555 000 0000"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="countryId">Country</Label>
                  <Select
                    value={formData.countryId}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="stateId">State</Label>
                  <Select
                    value={formData.stateId}
                    onValueChange={handleStateChange}
                    disabled={!formData.countryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStates.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="cityId">City</Label>
                  <Select
                    value={formData.cityId}
                    onValueChange={handleCityChange}
                    disabled={!formData.stateId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                placeholder="789 Beach Road, Miami Beach, FL 33140"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              {property ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};