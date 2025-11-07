import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { mockCountries as initialCountries } from '../../mockAdmin';
import { CountryDialog } from '../../components/admin/CountryDialog';
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

export const Countries = () => {
  const [countries, setCountries] = useLocalStorage('smartflags_countries', initialCountries);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingCountry(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (country, e) => {
    e.stopPropagation();
    setEditingCountry(country);
    setIsDialogOpen(true);
  };

  const handleSave = (countryData) => {
    if (editingCountry) {
      setCountries(countries.map(c =>
        c.id === editingCountry.id ? { ...c, ...countryData } : c
      ));
      toast.success('Country updated successfully!');
    } else {
      const newCountry = {
        id: `country-${Date.now()}`,
        ...countryData,
        createdAt: new Date().toISOString()
      };
      setCountries([...countries, newCountry]);
      toast.success('Country created successfully!');
    }
    setIsDialogOpen(false);
    setEditingCountry(null);
  };

  const handleDelete = (id) => {
    setCountries(countries.filter(c => c.id !== id));
    toast.success('Country deleted successfully!');
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Countries</h1>
            <p className="text-slate-600">Manage country master data</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Country
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Grid View */}
        {filteredCountries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-12 text-center">
            <Globe className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No countries found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCountries.map((country) => (
                <div
                  key={country.id}
                  className="bg-white rounded-xl shadow-lg border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Globe className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => handleEdit(country, e)}
                          className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(country.id);
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
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {country.name}
                    </h3>
                    
                    <div className="inline-flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full">
                      <span className="text-xs font-mono font-bold text-emerald-700">Code: {country.code}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm text-slate-500">
              Showing {filteredCountries.length} of {countries.length} countries
            </div>
          </>
        )}
      </div>

      <CountryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        country={editingCountry}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the country.
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