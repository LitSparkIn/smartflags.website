import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Plus, ChefHat, Search, Pencil, Trash2, ToggleLeft, ToggleRight, ExternalLink, Copy } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { MenuDialog } from '../../components/user/MenuDialog';
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

export const Menus = () => {
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
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
      setFilteredMenus(
        menus.filter(menu => 
          menu.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredMenus(menus);
    }
  }, [searchTerm, menus]);

  const fetchAllData = async (propertyId) => {
    try {
      setLoading(true);
      const [menusRes, itemsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/menus/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/menu-items/${propertyId}`)
      ]);

      if (menusRes.data.success) {
        setMenus(menusRes.data.menus);
        setFilteredMenus(menusRes.data.menus);
      }
      if (itemsRes.data.success) {
        setItems(itemsRes.data.items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Failed to load menus", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMenu(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setIsDialogOpen(true);
  };

  const handleSave = async (menuData) => {
    try {
      if (editingMenu) {
        const response = await axios.put(`${BACKEND_URL}/api/menus/${editingMenu.id}`, menuData);
        if (response.data.success) {
          toast({ title: "Success", description: "Menu updated successfully" });
          fetchAllData(user.entityId);
        }
      } else {
        const response = await axios.post(`${BACKEND_URL}/api/menus`, { ...menuData, propertyId: user.entityId });
        if (response.data.success) {
          toast({ title: "Success", description: "Menu created successfully" });
          fetchAllData(user.entityId);
        }
      }
      setIsDialogOpen(false);
      setEditingMenu(null);
    } catch (error) {
      console.error('Error saving menu:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save menu", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/api/menus/${id}`);
      if (response.data.success) {
        toast({ title: "Success", description: "Menu deleted successfully" });
        fetchAllData(user.entityId);
      }
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to delete menu", variant: "destructive" });
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (menu) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/api/menus/${menu.id}`, { isActive: !menu.isActive });
      if (response.data.success) {
        toast({ title: "Success", description: `Menu ${!menu.isActive ? 'activated' : 'deactivated'} successfully` });
        fetchAllData(user.entityId);
      }
    } catch (error) {
      console.error('Error toggling menu status:', error);
      toast({ title: "Error", description: "Failed to toggle menu status", variant: "destructive" });
    }
  };

  const copyMenuLink = (menuId) => {
    const link = `${window.location.origin}/menu/${user.entityId}/${menuId}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Success", description: "Menu link copied to clipboard!" });
  };

  const openMenuLink = (menuId) => {
    const link = `/menu/${user.entityId}/${menuId}`;
    window.open(link, '_blank');
  };

  const getItemsByIds = (itemIds) => {
    return items.filter(item => itemIds?.includes(item.id));
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading menus...</p>
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
            <h1 className="text-2xl font-bold text-slate-800">Menus</h1>
            <p className="text-slate-600 mt-1">Manage your menu collections and share them with guests</p>
          </div>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Menu
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input type="text" placeholder="Search menus..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {filteredMenus.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No menus found</h3>
            <p className="text-slate-600 mb-4">{searchTerm ? 'Try adjusting your search terms' : 'Create your first menu to get started'}</p>
            {!searchTerm && <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" />Add Menu</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenus.map((menu) => {
              const menuItems = getItemsByIds(menu.itemIds || []);
              return (
                <div key={menu.id} className={`bg-white rounded-xl shadow-lg border-2 hover:shadow-2xl transition-all duration-300 ${menu.isActive ? 'border-slate-100' : 'border-slate-300 opacity-60'}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{menu.name}</h3>
                        <p className="text-sm text-slate-500">{menuItems.length} items</p>
                      </div>
                      {!menu.isActive && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Inactive</span>
                      )}
                    </div>

                    {menuItems.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-slate-600 mb-2">Items in this menu:</p>
                        <div className="flex flex-wrap gap-1">
                          {menuItems.slice(0, 5).map((item) => (
                            <span key={item.id} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                              {item.name}
                            </span>
                          ))}
                          {menuItems.length > 5 && (
                            <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold">
                              +{menuItems.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Public Menu Link:</p>
                      <code className="text-xs text-blue-600 break-all block mb-2">
                        {window.location.origin}/menu/{user.entityId}/{menu.id}
                      </code>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyMenuLink(menu.id)}
                          className="flex-1 text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMenuLink(menu.id)}
                          className="flex-1 text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                      <button onClick={() => handleToggleActive(menu)} className={`flex items-center space-x-1 text-sm font-medium ${menu.isActive ? 'text-slate-600' : 'text-green-600'} hover:opacity-70 transition-opacity`}>
                        {menu.isActive ? <><ToggleRight className="w-5 h-5" /><span>Active</span></> : <><ToggleLeft className="w-5 h-5" /><span>Inactive</span></>}
                      </button>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(menu)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(menu.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MenuDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        menu={editingMenu} 
        onSave={handleSave}
        items={items}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the menu.</AlertDialogDescription>
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
