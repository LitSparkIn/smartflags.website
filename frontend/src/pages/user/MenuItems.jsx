import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Plus, UtensilsCrossed, Search, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MenuItemDialog } from '../../components/user/MenuItemDialog';
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

export const MenuItems = () => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAllData(parsedUser.entityId);
    }
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      setFilteredItems(
        items.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items]);

  const fetchAllData = async (propertyId) => {
    try {
      setLoading(true);
      const [itemsRes, categoriesRes, tagsRes, restrictionsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/menu-items/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/menu-categories/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/menu-tags/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/dietary-restrictions/${propertyId}`)
      ]);

      if (itemsRes.data.success) {
        const sortedItems = itemsRes.data.items.sort((a, b) => b.priority - a.priority);
        setItems(sortedItems);
        setFilteredItems(sortedItems);
      }
      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
      if (tagsRes.data.success) setTags(tagsRes.data.tags);
      if (restrictionsRes.data.success) setRestrictions(restrictionsRes.data.restrictions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Failed to load menu data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSave = async (itemData) => {
    try {
      if (editingItem) {
        const response = await axios.put(`${BACKEND_URL}/api/menu-items/${editingItem.id}`, itemData);
        if (response.data.success) {
          toast({ title: "Success", description: "Menu item updated successfully" });
          fetchAllData(user.entityId);
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/menu-items`, { ...itemData, propertyId: user.entityId });
        if (response.data.success) {
          toast({ title: "Success", description: "Menu item created successfully" });
          fetchAllData(user.entityId);
        }
      }
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save menu item", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/menu-items/${id}`);
      if (response.data.success) {
        toast({ title: "Success", description: "Menu item deleted successfully" });
        fetchAllData(user.entityId);
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to delete menu item", variant: "destructive" });
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/menu-items/${item.id}`, { isActive: !item.isActive });
      if (response.data.success) {
        toast({ title: "Success", description: `Menu item ${!item.isActive ? 'activated' : 'deactivated'} successfully` });
        fetchAllData(user.entityId);
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
      toast({ title: "Error", description: "Failed to toggle item status", variant: "destructive" });
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getTagsByIds = (tagIds) => {
    return tags.filter(t => tagIds.includes(t.id));
  };

  const getRestrictionsByIds = (restrictionIds) => {
    return restrictions.filter(r => restrictionIds.includes(r.id));
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading menu items...</p>
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
            <h1 className="text-2xl font-bold text-slate-800">Menu Items</h1>
            <p className="text-slate-600 mt-1">Manage your complete menu with dishes, drinks, and more</p>
          </div>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input type="text" placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <UtensilsCrossed className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No menu items found</h3>
            <p className="text-slate-600 mb-4">{searchTerm ? 'Try adjusting your search terms' : 'Create your first menu item to get started'}</p>
            {!searchTerm && <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" />Add Item</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className={`bg-white rounded-xl shadow-lg border-2 hover:shadow-2xl transition-all duration-300 overflow-hidden ${item.isActive ? 'border-slate-100' : 'border-slate-300 opacity-60'}`}>
                {item.image && (
                  <div className="h-48 bg-slate-200 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {!item.image && (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <UtensilsCrossed className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-500">{getCategoryName(item.categoryId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${item.price.toFixed(2)}</p>
                      {item.priority > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          Priority {item.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{item.description}</p>
                  )}

                  {getTagsByIds(item.tagIds || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {getTagsByIds(item.tagIds).map((tag) => (
                        <span key={tag.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: tag.color }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {getRestrictionsByIds(item.dietaryRestrictionIds || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {getRestrictionsByIds(item.dietaryRestrictionIds).map((restriction) => (
                        <span key={restriction.id} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {restriction.icon} {restriction.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {!item.isActive && (
                    <span className="inline-block mb-3 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Inactive</span>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <button onClick={() => handleToggleActive(item)} className={`flex items-center space-x-1 text-sm font-medium ${item.isActive ? 'text-slate-600' : 'text-green-600'} hover:opacity-70 transition-opacity`}>
                      {item.isActive ? <><ToggleRight className="w-5 h-5" /><span>Active</span></> : <><ToggleLeft className="w-5 h-5" /><span>Inactive</span></>}
                    </button>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MenuItemDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        item={editingItem} 
        onSave={handleSave}
        categories={categories}
        tags={tags}
        restrictions={restrictions}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the menu item.</AlertDialogDescription>
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
