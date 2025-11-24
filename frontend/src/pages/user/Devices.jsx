import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, Smartphone, Search, Power, PowerOff } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { DeviceDialog } from '../../components/user/DeviceDialog';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchDevices(parsedUser.entityId);
    }
  }, []);

  const fetchDevices = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/devices/${propertyId}`);
      if (response.data.success) {
        setDevices(response.data.devices);
        setFilteredDevices(response.data.devices);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch devices",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter(device => 
        device.deviceId.toLowerCase().includes(term)
      );
      setFilteredDevices(filtered);
    }
  };

  const handleSave = async (data) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/devices`, data);
      
      if (response.data) {
        toast({
          title: "Success",
          description: "Device added successfully"
        });
        fetchDevices(user.entityId);
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving device:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to add device",
        variant: "destructive"
      });
    }
  };

  const handleToggleDevice = async (deviceId, currentState) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/api/devices/${deviceId}`,
        { enabled: !currentState }
      );
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: `Device ${!currentState ? 'enabled' : 'disabled'} successfully`
        });
        fetchDevices(user.entityId);
      }
    } catch (error) {
      console.error('Error toggling device:', error);
      toast({
        title: "Error",
        description: "Failed to toggle device",
        variant: "destructive"
      });
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Devices</h1>
            <p className="text-slate-600 mt-1">Manage waiter calling devices</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>

        {/* Search Bar */}
        {devices.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by device ID..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        )}

        {/* Device List */}
        {filteredDevices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No devices found' : 'No devices yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Add your first device to get started.'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Device
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Device ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Added</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDevices.map((device) => (
                    <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{device.deviceId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {device.enabled ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                            <Power className="w-3 h-3" />
                            Enabled
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                            <PowerOff className="w-3 h-3" />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(device.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleDevice(device.id, device.enabled)}
                          className={device.enabled ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                        >
                          {device.enabled ? (
                            <>
                              <PowerOff className="w-4 h-4 mr-1" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Power className="w-4 h-4 mr-1" />
                              Enable
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Showing <strong>{filteredDevices.length}</strong> of <strong>{devices.length}</strong> devices
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      <DeviceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        propertyId={user?.entityId}
      />
    </UserLayout>
  );
};
