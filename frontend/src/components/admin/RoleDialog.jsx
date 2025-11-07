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

export const RoleDialog = ({ open, onOpenChange, role, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [permissionInput, setPermissionInput] = useState('');

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setPermissionInput('');
  }, [role, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddPermission = () => {
    if (permissionInput.trim() && !formData.permissions.includes(permissionInput.trim())) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionInput.trim()]
      });
      setPermissionInput('');
    }
  };

  const handleRemovePermission = (index) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {role ? 'Edit Role' : 'Create Role'}
          </DialogTitle>
          <DialogDescription>
            {role
              ? 'Update the role details below.'
              : 'Fill in the details to create a new role.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Brief description of the role"
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex gap-2">
                <Input
                  value={permissionInput}
                  onChange={(e) => setPermissionInput(e.target.value)}
                  placeholder="e.g., users.view"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPermission();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddPermission}
                  variant="outline"
                >
                  Add
                </Button>
              </div>
              
              {/* Permission Tags */}
              {formData.permissions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50 rounded-lg">
                  {formData.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                    >
                      {permission}
                      <button
                        type="button"
                        onClick={() => handleRemovePermission(index)}
                        className="hover:text-amber-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
              {role ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};