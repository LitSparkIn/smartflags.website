import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, Map, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { StateDialog } from '../../components/admin/StateDialog';
import { toast } from 'sonner';
import axios from 'axios';
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const States = () => {
  const [states, setStates] = useState([]);
  const [countries, setCountries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountryId, setFilterCountryId] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const statesResponse = await axios.get(`${BACKEND_URL}/api/states`);
      if (statesResponse.data.success) {
        setStates(statesResponse.data.states);
      }
      
      const countriesResponse = await axios.get(`${BACKEND_URL}/api/countries`);
      if (countriesResponse.data.success) {
        setCountries(countriesResponse.data.countries);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (state) => {
    setEditingState(state);
    setIsDialogOpen(true);
  };

  const handleSave = async (stateData) => {
    try {
      if (editingState) {
        const response = await axios.put(`${BACKEND_URL}/api/states/${editingState.id}`, stateData);
        if (response.data.success) {
          toast.success('State updated successfully!');
          fetchData();
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/states`, stateData);
        if (response.data.success) {
          toast.success('State created successfully!');
          fetchData();
        }
      }
      setIsDialogOpen(false);
      setEditingState(null);
    } catch (error) {
      console.error('Error saving state:', error);
      toast.error(error.response?.data?.detail || 'Failed to save state');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/states/${id}`);
      if (response.data.success) {
        toast.success('State deleted successfully!');
        fetchData();
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting state:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete state');
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading states...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">States</h1>
            <p className="text-slate-600">Manage states and provinces</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
            disabled={countries.length === 0}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add State
          </Button>
        </div>

        {countries.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              ⚠️ Please add countries first before creating states.
            </p>
          </div>
        )}

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCountryId} onValueChange={setFilterCountryId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredStates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No states found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first state to get started'}
            </p>
            {!searchTerm && countries.length > 0 && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add State
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    State Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStates.map((state) => {
                  const country = countries.find(c => c.id === state.countryId);
                  return (
                    <tr key={state.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Map className="w-5 h-5 text-slate-400 mr-3" />
                          <span className="text-sm font-medium text-slate-900">{state.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{state.code}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-600">{country?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(state)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 mr-2"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(state.id)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        state={editingState}
        onSave={handleSave}
        countries={countries}
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
