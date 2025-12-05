import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Plus, Salad, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { DietaryRestrictionDialog } from '../../components/user/DietaryRestrictionDialog';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const DietaryRestrictions = () => {
  const [user, setUser] = useState(null);
  const [restrictions, setRestrictions] = useState([]);
  const [filteredRestrictions, setFilteredRestrictions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRestriction, setEditingRestriction] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchRestrictions(parsedUser.entityId);
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredRestrictions(restrictions.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))));
    } else {
      setFilteredRestrictions(restrictions);
    }
  }, [searchTerm, restrictions]);

  const fetchRestrictions = async (propertyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/dietary-restrictions/${propertyId}`);
      if (response.data.success) {
        setRestrictions(response.data.restrictions);
        setFilteredRestrictions(response.data.restrictions);
      }
    } catch (error) {
      console.error('Error fetching restrictions:', error);
      toast({ title: "Error", description: "Failed to load dietary restrictions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRestriction(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (restriction) => {
    setEditingRestriction(restriction);
    setIsDialogOpen(true);
  };

  const handleSave = async (restrictionData) => {
    try {
      if (editingRestriction) {
        const response = await axios.put(`${BACKEND_URL}/api/dietary-restrictions/${editingRestriction.id}`, restrictionData);
        if (response.data.success) {
          toast({ title: "Success", description: "Dietary restriction updated successfully" });
          fetchRestrictions(user.entityId);
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/dietary-restrictions`, { ...restrictionData, propertyId: user.entityId });
        if (response.data.success) {
          toast({ title: "Success", description: "Dietary restriction created successfully" });
          fetchRestrictions(user.entityId);
        }
      }
      setIsDialogOpen(false);
      setEditingRestriction(null);
    } catch (error) {
      console.error('Error saving restriction:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save dietary restriction", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/dietary-restrictions/${id}`);
      if (response.data.success) {
        toast({ title: "Success", description: "Dietary restriction deleted successfully" });
        fetchRestrictions(user.entityId);
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting restriction:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to delete dietary restriction", variant: "destructive" });
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (restriction) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/dietary-restrictions/${restriction.id}`, { isActive: !restriction.isActive });
      if (response.data.success) {
        toast({ title: "Success", description: `Dietary restriction ${!restriction.isActive ? 'activated' : 'deactivated'} successfully` });
        fetchRestrictions(user.entityId);
      }
    } catch (error) {
      console.error('Error toggling restriction status:', error);
      toast({ title: "Error", description: "Failed to toggle restriction status", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dietary restrictions...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dietary Restrictions</h1>
            <p className="text-slate-600 mt-1">Manage dietary options like Veg, Non-Veg, Vegan, Gluten-Free</p>
          </div>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Restriction
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input type="text" placeholder="Search dietary restrictions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {filteredRestrictions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Salad className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No dietary restrictions found</h3>
            <p className="text-slate-600 mb-4">{searchTerm ? 'Try adjusting your search terms' : 'Create your first dietary restriction to get started'}</p>
            {!searchTerm && <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" />Add Restriction</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestrictions.map((restriction) => (
              <div key={restriction.id} className={`bg-white rounded-xl shadow-lg border-2 hover:shadow-2xl transition-all duration-300 overflow-hidden ${restriction.isActive ? 'border-slate-100' : 'border-slate-300 opacity-60'}`}>
                <div className={`bg-gradient-to-br ${restriction.isActive ? 'from-green-500 to-emerald-600' : 'from-slate-400 to-slate-500'} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                        {restriction.icon || '🍽️'}
                      </div>
                      <h3 className="text-xl font-bold text-white">{restriction.name}</h3>
                    </div>
                  </div>
                  {!restriction.isActive && <span className="inline-block mt-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">Inactive</span>}
                </div>

                <div className="p-6">
                  {restriction.description && <p className="text-sm text-slate-600 mb-4">{restriction.description}</p>}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <button onClick={() => handleToggleActive(restriction)} className={`flex items-center space-x-1 text-sm font-medium ${restriction.isActive ? 'text-slate-600' : 'text-green-600'} hover:opacity-70 transition-opacity`}>
                      {restriction.isActive ? <><ToggleRight className="w-5 h-5" /><span>Active</span></> : <><ToggleLeft className="w-5 h-5" /><span>Inactive</span></>}
                    </button>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(restriction)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(restriction.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DietaryRestrictionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} restriction={editingRestriction} onSave={handleSave} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the dietary restriction.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </UserLayout>
  );
};
