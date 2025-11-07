import React from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, Building2, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';

export const Properties = () => {
  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Properties</h1>
            <p className="text-slate-600 mt-1">Manage and monitor all your properties</p>
          </div>
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search properties..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-md p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No properties yet</h2>
            <p className="text-slate-600 mb-6">
              Get started by adding your first property. You'll be able to manage staff, seats, and monitor crowd levels.
            </p>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};
