import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Plus, Pencil, Trash2, Search, MapPin, Map } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { CityDialog } from '../../components/admin/CityDialog';
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

export const Cities = () => {
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStateId, setFilterStateId] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const citiesResponse = await axios.get(`${BACKEND_URL}/api/cities`);
      if (citiesResponse.data.success) {
        setCities(citiesResponse.data.cities);
      }
      
      const statesResponse = await axios.get(`${BACKEND_URL}/api/states`);
      if (statesResponse.data.success) {
        setStates(statesResponse.data.states);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter((city) => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = filterStateId === 'all' || city.stateId === filterStateId;
    return matchesSearch && matchesState;
  });

  const handleCreate = () => {
    setEditingCity(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setIsDialogOpen(true);
  };

  const handleSave = async (cityData) => {
    try {
      if (editingCity) {
        const response = await axios.put(`${BACKEND_URL}/api/cities/${editingCity.id}`, cityData);
        if (response.data.success) {
          toast.success('City updated successfully!');
          fetchData();
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/cities`, cityData);
        if (response.data.success) {
          toast.success('City created successfully!');
          fetchData();
        }
      }
      setIsDialogOpen(false);
      setEditingCity(null);
    } catch (error) {
      console.error('Error saving city:', error);
      toast.error(error.response?.data?.detail || 'Failed to save city');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/cities/${id}`);
      if (response.data.success) {
        toast.success('City deleted successfully!');
        fetchData();
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting city:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete city');
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading cities...</p>
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Cities</h1>
            <p className="text-slate-600">Manage cities and towns</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg"
            disabled={states.length === 0}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add City
          </Button>
        </div>

        {states.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              ⚠️ Please add states first before creating cities.
            </p>
          </div>
        )}

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStateId} onValueChange={setFilterStateId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredCities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No cities found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first city to get started'}
            </p>
            {!searchTerm && states.length > 0 && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add City
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    City Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    State
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCities.map((city) => {
                  const state = states.find(s => s.id === city.stateId);
                  return (
                    <tr key={city.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-slate-400 mr-3" />
                          <span className="text-sm font-medium text-slate-900">{city.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Map className="w-4 h-4 text-slate-400 mr-2" />
                          <span className="text-sm text-slate-600">{state?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(city)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 mr-2"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(city.id)}
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

      <CityDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        city={editingCity}
        onSave={handleSave}
        states={states}
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
