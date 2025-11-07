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

export const CountryDialog = ({ open, onOpenChange, country, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  useEffect(() => {
    if (country) {
      setFormData({
        name: country.name || '',
        code: country.code || ''
      });
    } else {
      setFormData({
        name: '',
        code: ''
      });
    }
  }, [country, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'code' ? value.toUpperCase() : value
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
            {country ? 'Edit Country' : 'Create Country'}
          </DialogTitle>
          <DialogDescription>
            {country
              ? 'Update the country details below.'
              : 'Fill in the details to create a new country.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Country Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., United States"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Country Code *</Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={5}
                placeholder="e.g., US, +1, +312"
                className="uppercase"
              />
              <p className="text-xs text-slate-500">Country code (up to 5 characters)</p>
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
              {country ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};