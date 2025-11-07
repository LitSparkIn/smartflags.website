import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, MapPin, Map } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mockCities as initialCities, getStateById } from '../../mockAdmin';
import { CityDialog } from '../../components/admin/CityDialog';
import { toast } from 'sonner';
import { useLocalStorage } from '../../hooks/useLocalStorage';
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

export const Cities = () => {
  const [cities, setCities] = useLocalStorage('smartflags_cities', initialCities);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStateId, setFilterStateId] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Get states from localStorage
  const getStates = () => {
    try {
      const stored = localStorage.getItem('smartflags_states');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  };

  const states = getStates();

  const filteredCities = cities.filter((city) => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterStateId === 'all' || city.stateId === filterStateId;
    return matchesSearch && matchesState;
  });

  const handleCreate = () => {
    setEditingCity(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (city, e) => {
    e.stopPropagation();
    setEditingCity(city);
    setIsDialogOpen(true);
  };

  const handleSave = (cityData) => {
    if (editingCity) {
      setCities(cities.map(c =>
        c.id === editingCity.id ? { ...c, ...cityData } : c
      ));
      toast.success('City updated successfully!');
    } else {
      const newCity = {
        id: `city-${Date.now()}`,
        ...cityData,
        createdAt: new Date().toISOString()
      };
      setCities([...cities, newCity]);
      toast.success('City created successfully!');
    }
    setIsDialogOpen(false);
    setEditingCity(null);
  };

  const handleDelete = (id) => {
    setCities(cities.filter(c => c.id !== id));
    toast.success('City deleted successfully!');
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Cities</h1>
            <p className="text-slate-600">Manage city master data</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add City
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStateId} onValueChange={setFilterStateId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {mockStates.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid View */}
        {filteredCities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-12 text-center">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No cities found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city) => {
                const state = getStateById(city.stateId);
                return (
                  <div
                    key={city.id}
                    className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
                      <div className="flex items-center justify-between">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <MapPin className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleEdit(city, e)}
                            className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(city.id);
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
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                        {city.name}
                      </h3>

                      <div className="flex items-center space-x-2 text-slate-600">
                        <Map className="w-4 h-4" />
                        <span className="text-sm">{state?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-sm text-slate-500">
              Showing {filteredCities.length} of {cities.length} cities
            </div>
          </>
        )}
      </div>

      <CityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        city={editingCity}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the city.
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