import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Plus, Tag, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MenuTagDialog } from '../../components/user/MenuTagDialog';
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

export const MenuTags = () => {
  const [user, setUser] = useState(null);
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchTags(parsedUser.entityId);
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredTags(tags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())));
    } else {
      setFilteredTags(tags);
    }
  }, [searchTerm, tags]);

  const fetchTags = async (propertyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/menu-tags/${propertyId}`);
      if (response.data.success) {
        setTags(response.data.tags);
        setFilteredTags(response.data.tags);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({ title: "Error", description: "Failed to load tags", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTag(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setIsDialogOpen(true);
  };

  const handleSave = async (tagData) => {
    try {
      if (editingTag) {
        const response = await axios.put(`${BACKEND_URL}/api/menu-tags/${editingTag.id}`, tagData);
        if (response.data.success) {
          toast({ title: "Success", description: "Tag updated successfully" });
          fetchTags(user.entityId);
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/menu-tags`, { ...tagData, propertyId: user.entityId });
        if (response.data.success) {
          toast({ title: "Success", description: "Tag created successfully" });
          fetchTags(user.entityId);
        }
      }
      setIsDialogOpen(false);
      setEditingTag(null);
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save tag", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/menu-tags/${id}`);
      if (response.data.success) {
        toast({ title: "Success", description: "Tag deleted successfully" });
        fetchTags(user.entityId);
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to delete tag", variant: "destructive" });
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (tag) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/menu-tags/${tag.id}`, { isActive: !tag.isActive });
      if (response.data.success) {
        toast({ title: "Success", description: `Tag ${!tag.isActive ? 'activated' : 'deactivated'} successfully` });
        fetchTags(user.entityId);
      }
    } catch (error) {
      console.error('Error toggling tag status:', error);
      toast({ title: "Error", description: "Failed to toggle tag status", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading tags...</p>
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
            <h1 className="text-2xl font-bold text-slate-800">Menu Tags</h1>
            <p className="text-slate-600 mt-1">Add labels like Spicy, Popular, New, Chef Special</p>
          </div>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Tag
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input type="text" placeholder="Search tags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {filteredTags.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No tags found</h3>
            <p className="text-slate-600 mb-4">{searchTerm ? 'Try adjusting your search terms' : 'Create your first menu tag to get started'}</p>
            {!searchTerm && <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" />Add Tag</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredTags.map((tag) => (
              <div key={tag.id} className={`bg-white rounded-xl shadow-lg border-2 hover:shadow-2xl transition-all duration-300 p-4 ${tag.isActive ? 'border-slate-100' : 'border-slate-300 opacity-60'}`}>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: tag.color }}>
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 text-center">{tag.name}</h3>
                  {!tag.isActive && <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Inactive</span>}
                  <div className="flex space-x-1 pt-2">
                    <button onClick={() => handleToggleActive(tag)} className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                      {tag.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                    </button>
                    <button onClick={() => handleEdit(tag)} className="p-1.5 hover:bg-blue-50 rounded transition-colors">
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </button>
                    <button onClick={() => setDeleteId(tag.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MenuTagDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} tag={editingTag} onSave={handleSave} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the tag.</AlertDialogDescription>
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
