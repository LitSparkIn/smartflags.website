import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Eye, Armchair } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const SmartView = () => {
  const [user, setUser] = useState(null);
  const [seatTypes, setSeatTypes] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchSeatTypes(parsedUser.entityId);
    }
  }, []);

  const fetchSeatTypes = async (propertyId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/seat-types/${propertyId}`);
      if (response.data.success) {
        setSeatTypes(response.data.seatTypes);
      }
    } catch (error) {
      console.error('Error fetching seat types:', error);
    }
  };

  // Generate random seat type assignment
  const getRandomSeatType = () => {
    if (seatTypes.length === 0) return { name: 'Seat', icon: null, id: null };
    const randomIndex = Math.floor(Math.random() * seatTypes.length);
    return seatTypes[randomIndex];
  };

  // Generate random status
  const getRandomStatus = () => {
    const statuses = ['available', 'available', 'available', 'occupied', 'occupied', 'reserved'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  // Mock seat data with random types - Compact layout
  const mockSeats = seatTypes.length > 0 ? [
    // Row 1 - 15 seats
    { id: 1, number: 'S01', seatType: getRandomSeatType(), status: getRandomStatus(), x: 8, y: 25 },
    { id: 2, number: 'S02', seatType: getRandomSeatType(), status: getRandomStatus(), x: 14, y: 25 },
    { id: 3, number: 'S03', seatType: getRandomSeatType(), status: getRandomStatus(), x: 20, y: 25 },
    { id: 4, number: 'S04', seatType: getRandomSeatType(), status: getRandomStatus(), x: 26, y: 25 },
    { id: 5, number: 'S05', seatType: getRandomSeatType(), status: getRandomStatus(), x: 32, y: 25 },
    { id: 6, number: 'S06', seatType: getRandomSeatType(), status: getRandomStatus(), x: 38, y: 25 },
    { id: 7, number: 'S07', seatType: getRandomSeatType(), status: getRandomStatus(), x: 44, y: 25 },
    { id: 8, number: 'S08', seatType: getRandomSeatType(), status: getRandomStatus(), x: 50, y: 25 },
    { id: 9, number: 'S09', seatType: getRandomSeatType(), status: getRandomStatus(), x: 56, y: 25 },
    { id: 10, number: 'S10', seatType: getRandomSeatType(), status: getRandomStatus(), x: 62, y: 25 },
    { id: 11, number: 'S11', seatType: getRandomSeatType(), status: getRandomStatus(), x: 68, y: 25 },
    { id: 12, number: 'S12', seatType: getRandomSeatType(), status: getRandomStatus(), x: 74, y: 25 },
    { id: 13, number: 'S13', seatType: getRandomSeatType(), status: getRandomStatus(), x: 80, y: 25 },
    { id: 14, number: 'S14', seatType: getRandomSeatType(), status: getRandomStatus(), x: 86, y: 25 },
    { id: 15, number: 'S15', seatType: getRandomSeatType(), status: getRandomStatus(), x: 92, y: 25 },

    // Row 2 - 15 seats
    { id: 16, number: 'S16', seatType: getRandomSeatType(), status: getRandomStatus(), x: 8, y: 35 },
    { id: 17, number: 'S17', seatType: getRandomSeatType(), status: getRandomStatus(), x: 14, y: 35 },
    { id: 18, number: 'S18', seatType: getRandomSeatType(), status: getRandomStatus(), x: 20, y: 35 },
    { id: 19, number: 'S19', seatType: getRandomSeatType(), status: getRandomStatus(), x: 26, y: 35 },
    { id: 20, number: 'S20', seatType: getRandomSeatType(), status: getRandomStatus(), x: 32, y: 35 },
    { id: 21, number: 'S21', seatType: getRandomSeatType(), status: getRandomStatus(), x: 38, y: 35 },
    { id: 22, number: 'S22', seatType: getRandomSeatType(), status: getRandomStatus(), x: 44, y: 35 },
    { id: 23, number: 'S23', seatType: getRandomSeatType(), status: getRandomStatus(), x: 50, y: 35 },
    { id: 24, number: 'S24', seatType: getRandomSeatType(), status: getRandomStatus(), x: 56, y: 35 },
    { id: 25, number: 'S25', seatType: getRandomSeatType(), status: getRandomStatus(), x: 62, y: 35 },
    { id: 26, number: 'S26', seatType: getRandomSeatType(), status: getRandomStatus(), x: 68, y: 35 },
    { id: 27, number: 'S27', seatType: getRandomSeatType(), status: getRandomStatus(), x: 74, y: 35 },
    { id: 28, number: 'S28', seatType: getRandomSeatType(), status: getRandomStatus(), x: 80, y: 35 },
    { id: 29, number: 'S29', seatType: getRandomSeatType(), status: getRandomStatus(), x: 86, y: 35 },
    { id: 30, number: 'S30', seatType: getRandomSeatType(), status: getRandomStatus(), x: 92, y: 35 },

    // Row 3 - 15 seats
    { id: 31, number: 'S31', seatType: getRandomSeatType(), status: getRandomStatus(), x: 8, y: 45 },
    { id: 32, number: 'S32', seatType: getRandomSeatType(), status: getRandomStatus(), x: 14, y: 45 },
    { id: 33, number: 'S33', seatType: getRandomSeatType(), status: getRandomStatus(), x: 20, y: 45 },
    { id: 34, number: 'S34', seatType: getRandomSeatType(), status: getRandomStatus(), x: 26, y: 45 },
    { id: 35, number: 'S35', seatType: getRandomSeatType(), status: getRandomStatus(), x: 32, y: 45 },
    { id: 36, number: 'S36', seatType: getRandomSeatType(), status: getRandomStatus(), x: 38, y: 45 },
    { id: 37, number: 'S37', seatType: getRandomSeatType(), status: getRandomStatus(), x: 44, y: 45 },
    { id: 38, number: 'S38', seatType: getRandomSeatType(), status: getRandomStatus(), x: 50, y: 45 },
    { id: 39, number: 'S39', seatType: getRandomSeatType(), status: getRandomStatus(), x: 56, y: 45 },
    { id: 40, number: 'S40', seatType: getRandomSeatType(), status: getRandomStatus(), x: 62, y: 45 },
    { id: 41, number: 'S41', seatType: getRandomSeatType(), status: getRandomStatus(), x: 68, y: 45 },
    { id: 42, number: 'S42', seatType: getRandomSeatType(), status: getRandomStatus(), x: 74, y: 45 },
    { id: 43, number: 'S43', seatType: getRandomSeatType(), status: getRandomStatus(), x: 80, y: 45 },
    { id: 44, number: 'S44', seatType: getRandomSeatType(), status: getRandomStatus(), x: 86, y: 45 },
    { id: 45, number: 'S45', seatType: getRandomSeatType(), status: getRandomStatus(), x: 92, y: 45 },

    // Row 4 - 15 seats
    { id: 46, number: 'S46', seatType: getRandomSeatType(), status: getRandomStatus(), x: 8, y: 60 },
    { id: 47, number: 'S47', seatType: getRandomSeatType(), status: getRandomStatus(), x: 14, y: 60 },
    { id: 48, number: 'S48', seatType: getRandomSeatType(), status: getRandomStatus(), x: 20, y: 60 },
    { id: 49, number: 'S49', seatType: getRandomSeatType(), status: getRandomStatus(), x: 26, y: 60 },
    { id: 50, number: 'S50', seatType: getRandomSeatType(), status: getRandomStatus(), x: 32, y: 60 },
    { id: 51, number: 'S51', seatType: getRandomSeatType(), status: getRandomStatus(), x: 38, y: 60 },
    { id: 52, number: 'S52', seatType: getRandomSeatType(), status: getRandomStatus(), x: 44, y: 60 },
    { id: 53, number: 'S53', seatType: getRandomSeatType(), status: getRandomStatus(), x: 50, y: 60 },
    { id: 54, number: 'S54', seatType: getRandomSeatType(), status: getRandomStatus(), x: 56, y: 60 },
    { id: 55, number: 'S55', seatType: getRandomSeatType(), status: getRandomStatus(), x: 62, y: 60 },
    { id: 56, number: 'S56', seatType: getRandomSeatType(), status: getRandomStatus(), x: 68, y: 60 },
    { id: 57, number: 'S57', seatType: getRandomSeatType(), status: getRandomStatus(), x: 74, y: 60 },
    { id: 58, number: 'S58', seatType: getRandomSeatType(), status: getRandomStatus(), x: 80, y: 60 },
    { id: 59, number: 'S59', seatType: getRandomSeatType(), status: getRandomStatus(), x: 86, y: 60 },
    { id: 60, number: 'S60', seatType: getRandomSeatType(), status: getRandomStatus(), x: 92, y: 60 },

    // Row 5 - 15 seats
    { id: 61, number: 'S61', seatType: getRandomSeatType(), status: getRandomStatus(), x: 8, y: 80 },
    { id: 62, number: 'S62', seatType: getRandomSeatType(), status: getRandomStatus(), x: 14, y: 80 },
    { id: 63, number: 'S63', seatType: getRandomSeatType(), status: getRandomStatus(), x: 20, y: 80 },
    { id: 64, number: 'S64', seatType: getRandomSeatType(), status: getRandomStatus(), x: 26, y: 80 },
    { id: 65, number: 'S65', seatType: getRandomSeatType(), status: getRandomStatus(), x: 32, y: 80 },
    { id: 66, number: 'S66', seatType: getRandomSeatType(), status: getRandomStatus(), x: 38, y: 80 },
    { id: 67, number: 'S67', seatType: getRandomSeatType(), status: getRandomStatus(), x: 44, y: 80 },
    { id: 68, number: 'S68', seatType: getRandomSeatType(), status: getRandomStatus(), x: 50, y: 80 },
    { id: 69, number: 'S69', seatType: getRandomSeatType(), status: getRandomStatus(), x: 56, y: 80 },
    { id: 70, number: 'S70', seatType: getRandomSeatType(), status: getRandomStatus(), x: 62, y: 80 },
    { id: 71, number: 'S71', seatType: getRandomSeatType(), status: getRandomStatus(), x: 68, y: 80 },
    { id: 72, number: 'S72', seatType: getRandomSeatType(), status: getRandomStatus(), x: 74, y: 80 },
    { id: 73, number: 'S73', seatType: getRandomSeatType(), status: getRandomStatus(), x: 80, y: 80 },
    { id: 74, number: 'S74', seatType: getRandomSeatType(), status: getRandomStatus(), x: 86, y: 80 },
    { id: 75, number: 'S75', seatType: getRandomSeatType(), status: getRandomStatus(), x: 92, y: 80 },
  ] : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 border-green-600';
      case 'occupied':
        return 'bg-red-500 border-red-600';
      case 'reserved':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const stats = {
    total: mockSeats.length,
    available: mockSeats.filter(s => s.status === 'available').length,
    occupied: mockSeats.filter(s => s.status === 'occupied').length,
    reserved: mockSeats.filter(s => s.status === 'reserved').length,
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SmartView</h1>
                <p className="text-blue-50">Real-time seat monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Live</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-slate-500">
            <p className="text-sm text-slate-600 mb-1">Total Seats</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <p className="text-sm text-slate-600 mb-1">Available</p>
            <p className="text-3xl font-bold text-green-600">{stats.available}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
            <p className="text-sm text-slate-600 mb-1">Occupied</p>
            <p className="text-3xl font-bold text-red-600">{stats.occupied}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
            <p className="text-sm text-slate-600 mb-1">Reserved</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.reserved}</p>
          </div>
        </div>

        {/* Beach View with Seats */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Beach Layout</h2>
              {seatTypes.length > 0 ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded border border-green-600"></div>
                    <span className="text-sm text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded border border-red-600"></div>
                    <span className="text-sm text-slate-600">Occupied</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded border border-yellow-600"></div>
                    <span className="text-sm text-slate-600">Reserved</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-orange-600">⚠️ Please create seat types first</p>
              )}
            </div>
          </div>
          
          {/* Beach Background with Seats */}
          <div 
            className="relative w-full h-[600px] bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: `url('https://customer-assets.emergentagent.com/job_smartbeach-system/artifacts/16fpeotq_istockphoto-969085876-612x612.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Semi-transparent overlay for better seat visibility */}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
            
            {/* Seats */}
            <div className="absolute inset-0">
              {mockSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="absolute group cursor-pointer transition-transform hover:scale-110"
                  style={{ 
                    left: `${seat.x}%`, 
                    top: `${seat.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Seat Icon */}
                  <div className={`w-8 h-8 ${getStatusColor(seat.status)} rounded-lg shadow-lg border-2 flex items-center justify-center transition-all p-1`}>
                    {seat.seatType.icon ? (
                      <img 
                        src={seat.seatType.icon} 
                        alt={seat.seatType.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Armchair className="w-4 h-4 text-white" />
                    )}
                  </div>
                  
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                      <p className="font-bold">{seat.number}</p>
                      <p className="text-slate-300">{seat.seatType.name}</p>
                      <p className={`font-semibold ${
                        seat.status === 'available' ? 'text-green-400' :
                        seat.status === 'occupied' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {seat.status.toUpperCase()}
                      </p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Water Indicator - Top */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-blue-500/30 to-transparent h-20 flex items-start justify-center pt-2">
              <span className="text-white font-semibold text-sm bg-blue-600/80 px-4 py-1 rounded-full backdrop-blur-sm">
                🌊 Water
              </span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Hover over any seat to see detailed information. Click on a seat to view or update its status.
          </p>
        </div>
      </div>
    </UserLayout>
  );
};
