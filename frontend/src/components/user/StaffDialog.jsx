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
import { Users, Mail, Phone, Lock, UserCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const StaffDialog = ({ open, onOpenChange, staff, onSave, propertyId, roles }) => {
  const [formData, setFormData] = useState({
    roleId: '',
    name: '',
    email: '',
    phone: '',
    username: '',
    pin: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (staff) {
      setFormData({
        roleId: staff.roleId,
        name: staff.name,
        email: staff.email,
        phone: staff.phone || '',
        username: staff.username || '',
        pin: staff.pin || '',
        password: '' // Don't prefill password on edit
      });
    } else {
      setFormData({
        roleId: '',
        name: '',
        email: '',
        phone: '',
        username: '',
        pin: '',
        password: ''
      });
    }
  }, [staff, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, roleId: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.roleId) {
      toast({
        title: "Validation Error",
        description: "Please select a role",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Username validation
    if (!formData.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive"
      });
      return;
    }

    // Validate username is alphanumeric
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(formData.username)) {
      toast({
        title: "Validation Error",
        description: "Username must be alphanumeric (letters and numbers only)",
        variant: "destructive"
      });
      return;
    }

    // PIN validation
    if (!formData.pin.trim()) {
      toast({
        title: "Validation Error",
        description: "PIN is required",
        variant: "destructive"
      });
      return;
    }

    // Validate PIN is numeric and 4-6 digits
    const pinRegex = /^[0-9]{4,6}$/;
    if (!pinRegex.test(formData.pin)) {
      toast({
        title: "Validation Error",
        description: "PIN must be 4-6 digits",
        variant: "destructive"
      });
      return;
    }

    // Password validation (only for new staff or if password is being changed)
    if (!staff || formData.password) {
      if (!formData.password) {
        toast({
          title: "Validation Error",
          description: "Password is required",
          variant: "destructive"
        });
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Validation Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    
    // Prepare data (exclude password if not provided in edit mode)
    const dataToSend = { ...formData, propertyId };
    if (staff && !formData.password) {
      delete dataToSend.password;
    }
    
    await onSave(dataToSend);
    setLoading(false);
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle>{staff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
              <DialogDescription>
                {staff ? 'Update staff member details' : 'Add a new staff member to your team'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Role */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">
                Role *
              </Label>
              <Select value={formData.roleId} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-medium">
                Name *
              </Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">
                Email *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700 font-medium">
                Phone
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">
                Password {staff ? '(leave blank to keep current)' : '*'}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={staff ? "Enter new password" : "Minimum 6 characters"}
                  className="pl-10"
                  required={!staff}
                />
              </div>
              <p className="text-xs text-slate-500">
                {staff ? "Only fill if you want to change the password" : "Must be at least 6 characters long"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || roles.length === 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : staff ? (
                'Update'
              ) : (
                'Create Staff Member'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
