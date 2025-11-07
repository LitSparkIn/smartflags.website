import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Map, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mockStates as initialStates, mockCountries, getCountryById } from '../../mockAdmin';
import { StateDialog } from '../../components/admin/StateDialog';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export const States = () => {
  const [states, setStates] = useState(initialStates);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountryId, setFilterCountryId] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filteredStates = states.filter((state) => {
    const matchesSearch = state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountryId === 'all' || state.countryId === filterCountryId;
    return matchesSearch && matchesCountry;
  });

  const handleCreate = () => {
    setEditingState(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (state, e) => {
    e.stopPropagation();
    setEditingState(state);
    setIsDialogOpen(true);
  };

  const handleSave = (stateData) => {
    if (editingState) {
      setStates(states.map(s =>
        s.id === editingState.id ? { ...s, ...stateData } : s
      ));
      toast.success('State updated successfully!');
    } else {
      const newState = {
        id: `state-${Date.now()}`,
        ...stateData,
        createdAt: new Date().toISOString()
      };
      setStates([...states, newState]);
      toast.success('State created successfully!');
    }
    setIsDialogOpen(false);
    setEditingState(null);
  };

  const handleDelete = (id) => {
    setStates(states.filter(s => s.id !== id));
    toast.success('State deleted successfully!');
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">States</h1>
            <p className="text-slate-600">Manage state master data</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add State
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCountryId} onValueChange={setFilterCountryId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {mockCountries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid View */}
        {filteredStates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-12 text-center">
            <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No states found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStates.map((state) => {
                const country = getCountryById(state.countryId);
                return (
                  <div
                    key={state.id}
                    className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Map className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleEdit(state, e)}
                            className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(state.id);
                            }}
                            className="w-9 h-9 bg-white/20 hover:bg-red-500 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {state.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                          <span className="text-xs font-mono font-bold text-blue-700">Code: {state.code}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-600">
                        <Globe className="w-4 h-4" />
                        <span className="text-sm">{country?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-sm text-slate-500">
              Showing {filteredStates.length} of {states.length} states
            </div>
          </>
        )}
      </div>

      <StateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        state={editingState}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};