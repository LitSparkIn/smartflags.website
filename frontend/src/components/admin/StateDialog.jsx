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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { mockCountries } from '../../mockAdmin';

export const StateDialog = ({ open, onOpenChange, state, onSave }) => {
  const [formData, setFormData] = useState({
    countryId: '',
    name: '',
    code: ''
  });

  useEffect(() => {
    if (state) {
      setFormData({
        countryId: state.countryId || '',
        name: state.name || '',
        code: state.code || ''
      });
    } else {
      setFormData({
        countryId: '',
        name: '',
        code: ''
      });
    }
  }, [state, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'code' ? value.toUpperCase() : value
    });
  };

  const handleCountryChange = (value) => {
    setFormData({
      ...formData,
      countryId: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {state ? 'Edit State' : 'Create State'}
          </DialogTitle>
          <DialogDescription>
            {state
              ? 'Update the state details below.'
              : 'Fill in the details to create a new state.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="countryId">Country *</Label>
              <Select
                value={formData.countryId}
                onValueChange={handleCountryChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {mockCountries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">State Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., California"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">State Code *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={3}
                placeholder="e.g., CA"
                className="uppercase"
              />
              <p className="text-xs text-slate-500">2-3 letter code</p>
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
              {state ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};