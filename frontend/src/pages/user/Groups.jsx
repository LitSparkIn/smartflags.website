import React from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, UsersRound, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';

export const Groups = () => {
  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Groups</h1>
            <p className="text-slate-600 mt-1">Organize seats into manageable groups</p>
          </div>
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Group
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search groups..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-md p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UsersRound className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No groups yet</h2>
            <p className="text-slate-600 mb-6">
              Create groups to organize seats by area, section, or any other criteria. Groups help in better crowd management.
            </p>
            <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Group
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};
