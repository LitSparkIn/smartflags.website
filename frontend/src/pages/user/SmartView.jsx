import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { Eye, Armchair, Users, CheckCircle2, Clock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const SmartView = () => {
  const [user, setUser] = useState(null);
  const [seats, setSeats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchAllData(parsedUser.entityId);
      
      // Auto-refresh every 30 seconds
      const dataInterval = setInterval(() => {
        fetchAllData(parsedUser.entityId);
      }, 30000);
      
      // Update current time every second for calling timers
      const timeInterval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      
      return () => {
        clearInterval(dataInterval);
        clearInterval(timeInterval);
      };
    }
  }, []);

  const fetchAllData = async (propertyId) => {
    try {
      setLoading(true);
      
      // Fetch seats
      const seatsResponse = await axios.get(`${BACKEND_URL}/api/seats/${propertyId}`);
      if (seatsResponse.data.success) {
        setSeats(seatsResponse.data.seats);
      }

      // Fetch groups
      const groupsResponse = await axios.get(`${BACKEND_URL}/api/groups/${propertyId}`);
      if (groupsResponse.data.success) {
        setGroups(groupsResponse.data.groups);
      }

      // Fetch seat types
      const seatTypesResponse = await axios.get(`${BACKEND_URL}/api/seat-types/${propertyId}`);
      if (seatTypesResponse.data.success) {
        setSeatTypes(seatTypesResponse.data.seatTypes);
      }

      // Fetch today's non-complete allocations
      const today = new Date().toISOString().split('T')[0];
      const allocationsResponse = await axios.get(`${BACKEND_URL}/api/allocations/${propertyId}`);
      if (allocationsResponse.data.success) {
        // Filter for today's non-complete allocations
        const todayAllocations = allocationsResponse.data.allocations.filter(
          alloc => alloc.allocationDate === today && alloc.status !== 'Complete'
        );
        setAllocations(todayAllocations);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get seat status and allocation details
  const getSeatStatus = (seatId) => {
    // Find if this seat is in any active allocation
    const allocation = allocations.find(alloc => 
      alloc.seatIds.includes(seatId) && alloc.status !== 'Complete'
    );
    
    if (!allocation) {
      return { status: 'Free', color: 'bg-white border-slate-300', allocation: null, isCalling: false };
    }
    
    // Check if calling flag is set
    const isCalling = allocation.callingFlag === "Calling" || allocation.callingFlag === "Calling for Checkout";
    
    // Return status based on allocation status
    const statusMap = {
      'Allocated': { status: 'Allocated', color: 'bg-blue-500 border-blue-600' },
      'Active': { status: 'Active', color: 'bg-green-500 border-green-600' },
      'Billing': { status: 'Billing', color: 'bg-purple-500 border-purple-600' },
      'Clear': { status: 'Clear', color: 'bg-teal-500 border-teal-600' },
      'Complete': { status: 'Free', color: 'bg-white border-slate-300' }
    };
    
    const statusInfo = statusMap[allocation.status] || { status: 'Free', color: 'bg-white border-slate-300' };
    
    return { 
      ...statusInfo, 
      allocation: allocation,
      isCalling: isCalling
    };
  };

  // Calculate statistics
  const calculateStats = () => {
    const total = seats.length;
    let available = 0;
    let occupied = 0;
    let reserved = 0;

    seats.forEach(seat => {
      const { status } = getSeatStatus(seat.id);
      
      if (status === 'Free') {
        available++;
      } else if (status === 'Active') {
        occupied++;
      } else if (status === 'Allocated') {
        reserved++;
      }
      // Billing and Clear are transitional states, not counted in main stats
    });

    return { total, available, occupied, reserved };
  };

  const stats = calculateStats();

  // Calculate calling duration
  const getCallingSince = (allocation) => {
    if (!allocation || allocation.callingFlag === "Non Calling") return null;
    
    const updatedAt = new Date(allocation.updatedAt);
    const elapsedSeconds = Math.floor((currentTime - updatedAt.getTime()) / 1000);
    
    const flagText = allocation.callingFlag === "Calling" ? "Calling" : "Checkout";
    
    return `${flagText} ${elapsedSeconds}s`;
  };

  // Group seats by group
  const groupedSeats = groups.map(group => {
    const groupSeats = seats.filter(seat => seat.groupId === group.id);
    return {
      ...group,
      seats: groupSeats
    };
  });

  // Seats without a group
  const ungroupedSeats = seats.filter(seat => !seat.groupId);

  // Get seat type info
  const getSeatType = (seatTypeId) => {
    return seatTypes.find(st => st.id === seatTypeId) || { name: 'Seat', icon: null };
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading SmartView...</p>
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
            <h1 className="text-2xl font-bold text-slate-800">SmartView</h1>
            <p className="text-slate-600 mt-1">Real-time seat monitoring and availability</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-refreshing every 30s</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-slate-500">
            <p className="text-sm text-slate-600 mb-1">Total Seats</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-white">
            <p className="text-sm text-slate-600 mb-1">Available</p>
            <p className="text-3xl font-bold text-slate-600">{stats.available}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <p className="text-sm text-slate-600 mb-1">Occupied</p>
            <p className="text-3xl font-bold text-green-600">{stats.occupied}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-sm text-slate-600 mb-1">Reserved</p>
            <p className="text-3xl font-bold text-blue-600">{stats.reserved}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Status Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white border-2 border-slate-300 rounded"></div>
              <span className="text-sm text-slate-600">Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 border-2 border-blue-600 rounded"></div>
              <span className="text-sm text-slate-600">Allocated</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 border-2 border-green-600 rounded"></div>
              <span className="text-sm text-slate-600">Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-500 border-2 border-purple-600 rounded"></div>
              <span className="text-sm text-slate-600">Billing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-teal-500 border-2 border-teal-600 rounded"></div>
              <span className="text-sm text-slate-600">Clear</span>
            </div>
          </div>
        </div>

        {/* Seats by Group */}
        {seats.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Armchair className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Seats Available</h3>
            <p className="text-slate-600">Please add seats to see them in SmartView</p>
          </div>
        ) : (
          <>
            {/* Grouped Seats */}
            {groupedSeats.map(group => (
              group.seats.length > 0 && (
                <div key={group.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">{group.name}</h2>
                    <p className="text-slate-300 text-sm">{group.seats.length} seats</p>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                      {group.seats.map(seat => {
                        const { status, color, allocation, isCalling } = getSeatStatus(seat.id);
                        const seatType = getSeatType(seat.seatTypeId);
                        
                        return (
                          <div
                            key={seat.id}
                            className="group relative"
                          >
                            {/* Category Badge (VIP, etc.) */}
                            {allocation && allocation.guestCategory && (
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                                  {allocation.guestCategory}
                                </span>
                              </div>
                            )}
                            
                            <div
                              className={`${color} rounded-lg border-2 p-3 transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex flex-col items-center justify-center min-h-[80px] ${
                                isCalling ? 'animate-pulse ring-4 ring-red-500 ring-offset-2 shadow-xl shadow-red-500/50' : ''
                              }`}
                            >
                              {seatType.icon ? (
                                <img 
                                  src={seatType.icon} 
                                  alt={seatType.name}
                                  className={`w-8 h-8 object-contain mb-1 ${
                                    status === 'Free' ? '' : 'brightness-0 invert'
                                  }`}
                                />
                              ) : (
                                <Armchair className={`w-6 h-6 mb-1 ${
                                  status === 'Free' ? 'text-slate-400' : 'text-white'
                                }`} />
                              )}
                              <span className={`text-xs font-semibold ${
                                status === 'Free' ? 'text-slate-700' : 'text-white'
                              }`}>
                                {seat.seatNumber}
                              </span>
                            </div>

                            {/* Calling Timer */}
                            {isCalling && (
                              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                                <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-pulse">
                                  {getCallingSince(allocation)}
                                </span>
                              </div>
                            )}
                            
                            {/* Enhanced Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[180px]">
                                <p className="font-bold text-sm mb-1">{seat.seatNumber}</p>
                                <p className="text-slate-300 mb-2">{seatType.name}</p>
                                <div className="border-t border-slate-700 pt-2 space-y-1">
                                  <p className="font-semibold text-teal-400">Status: {status}</p>
                                  {allocation ? (
                                    <>
                                      <p className="text-slate-200">
                                        <span className="text-slate-400">Guest:</span> {allocation.guestName}
                                      </p>
                                      <p className="text-slate-200">
                                        <span className="text-slate-400">Room:</span> {allocation.roomNumber}
                                      </p>
                                      {allocation.guestCategory && (
                                        <p className="text-amber-400">
                                          <span className="text-slate-400">Category:</span> {allocation.guestCategory}
                                        </p>
                                      )}
                                      <p className="text-slate-200 text-[10px] mt-1">
                                        <span className="text-slate-400">Time:</span> {new Date(allocation.createdAt).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-slate-300 italic">Available</p>
                                  )}
                                </div>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            ))}

            {/* Ungrouped Seats */}
            {ungroupedSeats.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-slate-500 to-slate-400 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">Ungrouped Seats</h2>
                  <p className="text-slate-200 text-sm">{ungroupedSeats.length} seats</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                    {ungroupedSeats.map(seat => {
                      const { status, color, allocation, isCalling } = getSeatStatus(seat.id);
                      const seatType = getSeatType(seat.seatTypeId);
                      
                      return (
                        <div
                          key={seat.id}
                          className="group relative"
                        >
                          {/* Category Badge (VIP, etc.) */}
                          {allocation && allocation.guestCategory && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                                {allocation.guestCategory}
                              </span>
                            </div>
                          )}
                          
                          <div
                            className={`${color} rounded-lg border-2 p-3 transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex flex-col items-center justify-center min-h-[80px] ${
                              isCalling ? 'animate-pulse ring-4 ring-red-500 ring-offset-2 shadow-xl shadow-red-500/50' : ''
                            }`}
                          >
                            {seatType.icon ? (
                              <img 
                                src={seatType.icon} 
                                alt={seatType.name}
                                className={`w-8 h-8 object-contain mb-1 ${
                                  status === 'Free' ? '' : 'brightness-0 invert'
                                }`}
                              />
                            ) : (
                              <Armchair className={`w-6 h-6 mb-1 ${
                                status === 'Free' ? 'text-slate-400' : 'text-white'
                              }`} />
                            )}
                            <span className={`text-xs font-semibold ${
                              status === 'Free' ? 'text-slate-700' : 'text-white'
                            }`}>
                              {seat.seatNumber}
                            </span>
                          </div>

                          {/* Calling Timer */}
                          {isCalling && (
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                              <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-pulse">
                                {getCallingSince(allocation)}
                              </span>
                            </div>
                          )}
                          
                          {/* Enhanced Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[180px]">
                              <p className="font-bold text-sm mb-1">{seat.seatNumber}</p>
                              <p className="text-slate-300 mb-2">{seatType.name}</p>
                              <div className="border-t border-slate-700 pt-2 space-y-1">
                                <p className="font-semibold text-teal-400">Status: {status}</p>
                                {allocation ? (
                                  <>
                                    <p className="text-slate-200">
                                      <span className="text-slate-400">Guest:</span> {allocation.guestName}
                                    </p>
                                    <p className="text-slate-200">
                                      <span className="text-slate-400">Room:</span> {allocation.roomNumber}
                                    </p>
                                    {allocation.guestCategory && (
                                      <p className="text-amber-400">
                                        <span className="text-slate-400">Category:</span> {allocation.guestCategory}
                                      </p>
                                    )}
                                    <p className="text-slate-200 text-[10px] mt-1">
                                      <span className="text-slate-400">Time:</span> {new Date(allocation.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-slate-300 italic">Available</p>
                                )}
                              </div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
};
