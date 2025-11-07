import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Eye, Armchair } from 'lucide-react';

export const SmartView = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Mock seat data with different types and statuses
  const mockSeats = [
    // Row 1 - Lounge Chairs
    { id: 1, number: 'LC01', type: 'Lounge Chair', status: 'available', x: 10, y: 15 },
    { id: 2, number: 'LC02', type: 'Lounge Chair', status: 'occupied', x: 20, y: 15 },
    { id: 3, number: 'LC03', type: 'Lounge Chair', status: 'available', x: 30, y: 15 },
    { id: 4, number: 'LC04', type: 'Lounge Chair', status: 'occupied', x: 40, y: 15 },
    { id: 5, number: 'LC05', type: 'Lounge Chair', status: 'reserved', x: 50, y: 15 },
    { id: 6, number: 'LC06', type: 'Lounge Chair', status: 'available', x: 60, y: 15 },
    { id: 7, number: 'LC07', type: 'Lounge Chair', status: 'occupied', x: 70, y: 15 },
    { id: 8, number: 'LC08', type: 'Lounge Chair', status: 'available', x: 80, y: 15 },

    // Row 2 - Lounge Chairs
    { id: 9, number: 'LC09', type: 'Lounge Chair', status: 'available', x: 10, y: 35 },
    { id: 10, number: 'LC10', type: 'Lounge Chair', status: 'occupied', x: 20, y: 35 },
    { id: 11, number: 'LC11', type: 'Lounge Chair', status: 'available', x: 30, y: 35 },
    { id: 12, number: 'LC12', type: 'Lounge Chair', status: 'reserved', x: 40, y: 35 },
    { id: 13, number: 'LC13', type: 'Lounge Chair', status: 'available', x: 50, y: 35 },
    { id: 14, number: 'LC14', type: 'Lounge Chair', status: 'occupied', x: 60, y: 35 },
    { id: 15, number: 'LC15', type: 'Lounge Chair', status: 'available', x: 70, y: 35 },
    { id: 16, number: 'LC16', type: 'Lounge Chair', status: 'available', x: 80, y: 35 },

    // Row 3 - Umbrellas with chairs
    { id: 17, number: 'U01', type: 'Umbrella Set', status: 'occupied', x: 15, y: 60 },
    { id: 18, number: 'U02', type: 'Umbrella Set', status: 'available', x: 35, y: 60 },
    { id: 19, number: 'U03', type: 'Umbrella Set', status: 'reserved', x: 55, y: 60 },
    { id: 20, number: 'U04', type: 'Umbrella Set', status: 'occupied', x: 75, y: 60 },

    // Row 4 - Cabanas
    { id: 21, number: 'CB01', type: 'Cabana', status: 'reserved', x: 20, y: 80 },
    { id: 22, number: 'CB02', type: 'Cabana', status: 'occupied', x: 50, y: 80 },
    { id: 23, number: 'CB03', type: 'Cabana', status: 'available', x: 80, y: 80 },
  ];

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

  const getSeatSize = (type) => {
    switch (type) {
      case 'Cabana':
        return 'w-12 h-12';
      case 'Umbrella Set':
        return 'w-10 h-10';
      default:
        return 'w-8 h-8';
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
                  <div className={`${getSeatSize(seat.type)} ${getStatusColor(seat.status)} rounded-lg shadow-lg border-2 flex items-center justify-center transition-all`}>
                    <Armchair className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                      <p className="font-bold">{seat.number}</p>
                      <p className="text-slate-300">{seat.type}</p>
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

            {/* Water Indicator */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/30 to-transparent h-20 flex items-end justify-center pb-2">
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
