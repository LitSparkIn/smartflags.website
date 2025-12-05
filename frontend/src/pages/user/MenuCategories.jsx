import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Plus, ChefHat, Search, Pencil, Trash2, GripVertical, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MenuCategoryDialog } from '../../components/user/MenuCategoryDialog';
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

export const MenuCategories = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCategories(parsedUser.entityId);
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredCategories(
        categories.filter(cat =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async (propertyId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/menu-categories/${propertyId}`);
      if (response.data.success) {
        setCategories(response.data.categories);
        setFilteredCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleSave = async (categoryData) => {
    try {
      if (editingCategory) {
        const response = await axios.put(
          `${BACKEND_URL}/api/menu-categories/${editingCategory.id}`,
          categoryData
        );
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Category updated successfully"
          });
          fetchCategories(user.entityId);
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/menu-categories`, {
          ...categoryData,
          propertyId: user.entityId
        });
        if (response.data.success) {
          toast({
            title: "Success",
            description: "Category created successfully"
          });
          fetchCategories(user.entityId);
        }
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save category",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/menu-categories/${id}`);
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Category deleted successfully"
        });
        fetchCategories(user.entityId);
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete category",
        variant: "destructive"
      });
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/menu-categories/${category.id}`,
        { isActive: !category.isActive }
      );
      if (response.data.success) {
        toast({
          title: "Success",
          description: `Category ${!category.isActive ? 'activated' : 'deactivated'} successfully`
        });
        fetchCategories(user.entityId);
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast({
        title: "Error",
        description: "Failed to toggle category status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading categories...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Menu Categories</h1>
            <p className="text-slate-600 mt-1">Organize your menu items into categories</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No categories found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first menu category to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`bg-white rounded-xl shadow-lg border-2 hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                  category.isActive ? 'border-slate-100' : 'border-slate-300 opacity-60'
                }`}
              >
                <div className={`bg-gradient-to-br ${
                  category.isActive 
                    ? 'from-teal-500 to-cyan-600' 
                    : 'from-slate-400 to-slate-500'
                } p-6`}>
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <ChefHat className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <GripVertical className="w-5 h-5 text-white/60" />
                      <span className="text-white/80 text-sm font-medium">#{category.displayOrder}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4">{category.name}</h3>
                  {!category.isActive && (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {category.description && (
                    <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`flex items-center space-x-1 text-sm font-medium ${
                        category.isActive ? 'text-slate-600' : 'text-green-600'
                      } hover:opacity-70 transition-opacity`}
                    >
                      {category.isActive ? (
                        <>
                          <ToggleRight className="w-5 h-5" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>

                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(category.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MenuCategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={editingCategory}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
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
    </UserLayout>
  );
};
