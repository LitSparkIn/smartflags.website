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

export const CityDialog = ({ open, onOpenChange, city, onSave }) => {
  const [formData, setFormData] = useState({
    stateId: '',
    name: ''
  });

  // Get states from localStorage - called each time dialog opens
  const [states, setStates] = useState([]);

  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('smartflags_states');
        setStates(stored ? JSON.parse(stored) : []);
      } catch (error) {
        setStates([]);
      }
    }
  }, [open]);

  useEffect(() => {
    if (city) {
      setFormData({
        stateId: city.stateId || '',
        name: city.name || ''
      });
    } else {
      setFormData({
        stateId: '',
        name: ''
      });
    }
  }, [city, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStateChange = (value) => {
    setFormData({
      ...formData,
      stateId: value
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
            {city ? 'Edit City' : 'Create City'}
          </DialogTitle>
          <DialogDescription>
            {city
              ? 'Update the city details below.'
              : 'Fill in the details to create a new city.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stateId">State *</Label>
              <Select
                value={formData.stateId}
                onValueChange={handleStateChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">City Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Los Angeles"
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
              {city ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};