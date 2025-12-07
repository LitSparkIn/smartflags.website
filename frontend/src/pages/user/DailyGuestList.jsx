import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Button } from '../../components/ui/button';
import { Plus, Users, Search, Pencil, Trash2, Upload, FileSpreadsheet, X } from 'lucide-react';
import { Input } from '../../components/ui/input';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';
import * as XLSX from 'xlsx';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const DailyGuestList = () => {
  const [guestList, setGuestList] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [importing, setImporting] = useState(false);
  const [configuration, setConfiguration] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchGuests(parsedUser.entityId);
      fetchConfiguration(parsedUser.entityId);
    }
  }, []);

  const fetchConfiguration = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/configuration/${propertyId}`);
      if (response.data.success) {
        setConfiguration(response.data.configuration);
      }
    } catch (error) {
      console.error('Error fetching configuration:', error);
    }
  };

  const fetchGuests = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/guests/${propertyId}`);
      if (response.data.success) {
        setGuestList(response.data.guests);
        setFilteredGuests(response.data.guests);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch guest list",
        variant: "destructive"
      });
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (term === '') {
      setFilteredGuests(guestList);
    } else {
      const filtered = guestList.filter(guest => 
        guest.guestName.toLowerCase().includes(term) ||
        guest.roomNumber.toLowerCase().includes(term) ||
        (guest.category && guest.category.toLowerCase().includes(term))
      );
      setFilteredGuests(filtered);
    }
  };

  const isGuestEligible = (guest) => {
    if (!guest.checkInDate || !guest.checkOutDate || !configuration) {
      return { eligible: true, reason: '' };
    }

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    const checkInDate = guest.checkInDate;
    const checkOutDate = guest.checkOutDate;
    const checkInTime = configuration.checkInTime || '14:00';
    const checkOutTime = configuration.checkOutTime || '11:00';

    // If current date is before check-in date
    if (currentDate < checkInDate) {
      return { eligible: false, reason: `Check-in is on ${new Date(checkInDate).toLocaleDateString()}` };
    }

    // If current date is the check-in date, check if it's past check-in time
    if (currentDate === checkInDate && currentTime < checkInTime) {
      return { eligible: false, reason: `Check-in time is ${checkInTime}` };
    }

    // If current date is after check-out date
    if (currentDate > checkOutDate) {
      return { eligible: false, reason: `Checked out on ${new Date(checkOutDate).toLocaleDateString()}` };
    }

    // If current date is the check-out date, check if it's past check-out time
    if (currentDate === checkOutDate && currentTime >= checkOutTime) {
      return { eligible: false, reason: `Check-out time was ${checkOutTime}` };
    }

    return { eligible: true, reason: '' };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate and transform data
      const guests = jsonData.map(row => ({
        roomNumber: String(row['Room Number'] || row['room_number'] || row['RoomNumber'] || '').trim(),
        guestName: String(row['Guest Name'] || row['guest_name'] || row['GuestName'] || '').trim(),
        category: row['Category'] || row['category'] || null,
        checkInDate: row['Check-in Date'] || row['Check-In Date'] || row['check_in_date'] || row['CheckInDate'] || row['checkin_date'] || null,
        checkOutDate: row['Check-out Date'] || row['Check-Out Date'] || row['check_out_date'] || row['CheckOutDate'] || row['checkout_date'] || null
      })).filter(g => g.roomNumber && g.guestName);

      if (guests.length === 0) {
        toast({
          title: "Invalid File",
          description: "No valid guest data found. Please check the file format.",
          variant: "destructive"
        });
        setImporting(false);
        return;
      }

      // Send to backend
      const response = await axios.post(`${BACKEND_URL}/api/guests/bulk`, {
        propertyId: user.entityId,
        guests: guests
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Successfully imported ${response.data.count} guests`
        });
        fetchGuests(user.entityId);
      }
    } catch (error) {
      console.error('Error importing guests:', error);
      toast({
        title: "Import Failed",
        description: error.response?.data?.detail || "Failed to import guest list",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all guests? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/guests/property/${user.entityId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: `Cleared ${response.data.count} guests`
        });
        fetchGuests(user.entityId);
      }
    } catch (error) {
      console.error('Error clearing guests:', error);
      toast({
        title: "Error",
        description: "Failed to clear guest list",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (guestId) => {
    if (!window.confirm('Are you sure you want to delete this guest?')) {
      return;
    }

    try {
      const response = await axios.delete(`${BACKEND_URL}/api/guests/${guestId}`);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Guest deleted successfully"
        });
        fetchGuests(user.entityId);
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast({
        title: "Error",
        description: "Failed to delete guest",
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
            <h1 className="text-2xl font-bold text-slate-800">Daily Guest List</h1>
            <p className="text-slate-600 mt-1">Manage your property's guest list</p>
          </div>
          <div className="flex gap-2">
            {guestList.length > 0 && (
              <Button 
                onClick={handleClearAll}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button 
              onClick={() => document.getElementById('excel-upload').click()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              disabled={importing}
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import from Excel
                </>
              )}
            </Button>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Excel File Format</p>
              <p className="text-sm text-blue-800">
                Your Excel file should have the following columns: <strong>Room Number</strong>, <strong>Guest Name</strong>, 
                <strong>Category</strong> (optional), <strong>Check-in Date</strong> (YYYY-MM-DD format), and <strong>Check-out Date</strong> (YYYY-MM-DD format)
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {guestList.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by guest name, room number, or category..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        )}

        {/* Guest List */}
        {filteredGuests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No guests found' : 'No guests yet'}
              </h2>
              <p className="text-slate-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Import your guest list from an Excel file to get started.'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => document.getElementById('excel-upload').click()}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import from Excel
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Room Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Guest Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check-in</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Check-out</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredGuests.map((guest) => {
                    const eligibility = isGuestEligible(guest);
                    return (
                      <tr key={guest.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{guest.roomNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{guest.guestName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {guest.category ? (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                              {guest.category}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {guest.checkInDate ? (
                            new Date(guest.checkInDate).toLocaleDateString()
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {guest.checkOutDate ? (
                            new Date(guest.checkOutDate).toLocaleDateString()
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {eligibility.eligible ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              ✓ Can allocate
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold" title={eligibility.reason}>
                              ✗ Not eligible
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(guest.id)}
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
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Showing <strong>{filteredGuests.length}</strong> of <strong>{guestList.length}</strong> guests
              </p>
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
};
