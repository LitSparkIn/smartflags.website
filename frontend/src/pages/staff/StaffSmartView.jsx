import React, { useState, useEffect } from 'react';
import { StaffLayout } from '../../components/staff/StaffLayout';
import { Armchair, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const StaffSmartView = () => {
  const [seats, setSeats] = useState([]);
  const [sections, setGroups] = useState([]);
  const [seatTypes, setSeatTypes] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      const propertyId = parsedUser.entityId;
      const selectedGroupId = parsedUser.selectedGroupId; // Get selected section from staff data

      const [seatsRes, groupsRes, typesRes, allocsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/seats/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/sections/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/seat-types/${propertyId}`),
        axios.get(`${BACKEND_URL}/api/allocations/${propertyId}`)
      ]);

      // Filter seats to only show those from the selected section
      if (seatsRes.data.success) {
        const allSeats = seatsRes.data.seats;
        if (selectedGroupId) {
          // Staff has selected a section - show only that section's seats
          const filteredSeats = allSeats.filter(seat => seat.sectionId === selectedGroupId);
          setSeats(filteredSeats);
        } else {
          // No section selected (e.g., Pool and Beach Manager) - show all seats
          setSeats(allSeats);
        }
      }
      
      // Filter sections to only show the selected section
      if (groupsRes.data.success) {
        const allGroups = groupsRes.data.sections;
        if (selectedGroupId) {
          // Show only the selected section
          const filteredGroups = allGroups.filter(section => section.id === selectedGroupId);
          setGroups(filteredGroups);
        } else {
          // Show all sections
          setGroups(allGroups);
        }
      }
      
      if (typesRes.data.success) setSeatTypes(typesRes.data.seatTypes);
      if (allocsRes.data.success) setAllocations(allocsRes.data.allocations);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeatType = (seatTypeId) => {
    return seatTypes.find(type => type.id === seatTypeId) || { name: 'Standard', icon: null };
  };

  const getSeatStatus = (seatId) => {
    const allocation = allocations.find(alloc => 
      alloc.seatIds.includes(seatId) && alloc.status !== 'Complete'
    );
    
    if (!allocation) {
      return { status: 'Free', color: 'bg-white border-slate-300', allocation: null, isCalling: false, callingDuration: 0 };
    }
    
    const isCalling = allocation.callingFlag === "Calling" || allocation.callingFlag === "Calling for Checkout";
    
    let callingDuration = 0;
    if (isCalling && allocation.updatedAt) {
      const updatedAt = new Date(allocation.updatedAt);
      callingDuration = Math.floor((currentTime - updatedAt.getTime()) / 1000);
    }
    
    let color;
    if (isCalling) {
      if (callingDuration > 90) {
        color = 'bg-red-500 border-red-600';
      } else if (callingDuration > 45) {
        color = 'bg-orange-500 border-orange-600';
      } else if (callingDuration > 15) {
        color = 'bg-yellow-500 border-yellow-600';
      } else {
        color = 'bg-blue-400 border-blue-500';
      }
    } else {
      const statusMap = {
        'Allocated': 'bg-blue-500 border-blue-600',
        'Active': 'bg-green-500 border-green-600',
        'Billing': 'bg-purple-500 border-purple-600',
        'Clear': 'bg-teal-500 border-teal-600',
        'Complete': 'bg-white border-slate-300'
      };
      color = statusMap[allocation.status] || 'bg-white border-slate-300';
    }
    
    return { 
      status: allocation.status,
      color: color,
      allocation: allocation,
      isCalling: isCalling,
      callingDuration: callingDuration
    };
  };

  const groupedSeats = sections.map(section => {
    const groupSeats = seats.filter(seat => seat.sectionId === section.id);
    return {
      ...section,
      seats: groupSeats
    };
  });

  const ungroupedSeats = seats.filter(seat => !seat.sectionId);

  const totalSeats = seats.length;
  const occupiedSeats = allocations.filter(a => a.status !== 'Complete').length;
  const availableSeats = totalSeats - occupiedSeats;

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading SmartView...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  // Get selected section info
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const selectedGroupName = userData.selectedGroupName;

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">SmartView Dashboard</h1>
            <p className="text-slate-600 mt-1">
              {selectedGroupName ? `Viewing: ${selectedGroupName}` : 'Real-time seat allocation overview'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedGroupName && (
              <Button 
                onClick={() => navigate('/staff/section-selection', { state: { staffData: userData } })}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Switch Group
              </Button>
            )}
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Seats</p>
                <p className="text-3xl font-bold text-slate-900">{totalSeats}</p>
              </div>
              <Armchair className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Available</p>
                <p className="text-3xl font-bold text-green-600">{availableSeats}</p>
              </div>
              <Armchair className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Occupied</p>
                <p className="text-3xl font-bold text-red-600">{occupiedSeats}</p>
              </div>
              <Armchair className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Grouped Seats */}
        {groupedSeats.map(section => (
          section.seats.length > 0 && (
            <div key={section.id} className="bg-white rounded-xl shadow-md overflow-visible">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white">{section.name}</h2>
                <p className="text-slate-300 text-sm mt-1">{section.seats.length} seats</p>
              </div>
              <div className="p-6">
                {(() => {
                  // Group seats by allocation
                  const seatsWithAllocation = [];
                  const seatsWithoutAllocation = [];
                  
                  section.seats.forEach(seat => {
                    const { allocation } = getSeatStatus(seat.id);
                    if (allocation) {
                      seatsWithAllocation.push({ seat, allocation });
                    } else {
                      seatsWithoutAllocation.push(seat);
                    }
                  });
                  
                  // Group by allocation ID
                  const allocationGroups = {};
                  seatsWithAllocation.forEach(({ seat, allocation }) => {
                    if (!allocationGroups[allocation.id]) {
                      allocationGroups[allocation.id] = {
                        allocation,
                        seats: []
                      };
                    }
                    allocationGroups[allocation.id].seats.push(seat);
                  });
                  
                  return (
                    <div className="flex flex-wrap gap-y-2 gap-x-4">
                      {/* Allocated seats grouped by allocation */}
                      {Object.values(allocationGroups).map(({ allocation, seats: allocSeats }) => (
                        <div 
                          key={allocation.id}
                          className="border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-lg p-2 cursor-pointer hover:bg-blue-50/50 transition-colors inline-flex flex-col gap-2 relative section"
                          onClick={() => navigate(`/user/allocation/${allocation.id}`)}
                        >
                          <div className="flex items-center space-x-2 px-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-slate-700">
                              {allocation.guestName} - Room {allocation.roomNumber}
                            </span>
                            {allocation.guestCategory && (
                              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {allocation.guestCategory}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-y-2 gap-x-4">
                            {allocSeats.map(seat => {
                              const { status, color, isCalling } = getSeatStatus(seat.id);
                              const seatType = getSeatType(seat.seatTypeId);
                              
                              return (
                                <div key={seat.id} className="relative">
                                  <div
                                    className={`${color} rounded-lg border-2 p-2 transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex flex-col items-center justify-center h-[88px] w-[60px] ${
                                      isCalling ? 'animate-pulse ring-4 ring-red-500 ring-offset-2 shadow-xl shadow-red-500/50' : ''
                                    }`}
                                  >
                                    {seatType.icon ? (
                                      <img 
                                        src={seatType.icon} 
                                        alt={seatType.name}
                                        className="w-6 h-6 object-contain mb-1 brightness-0 invert"
                                      />
                                    ) : (
                                      <Armchair className="w-5 h-5 mb-1 text-white" />
                                    )}
                                    <span className="text-[11px] font-semibold text-white">
                                      {seat.seatNumber}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Allocation Hover Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 opacity-0 section-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[200px]">
                              <p className="font-bold text-sm mb-1">{allocation.guestName}</p>
                              <p className="text-slate-300 mb-2">Room {allocation.roomNumber}</p>
                              <div className="border-t border-slate-700 pt-2 space-y-1">
                                <p className="font-semibold text-teal-400">Status: {allocation.status}</p>
                                {allocation.guestCategory && (
                                  <p className="text-amber-400">
                                    <span className="text-slate-400">Category:</span> {allocation.guestCategory}
                                  </p>
                                )}
                                <p className="text-slate-200 text-[10px] mt-1">
                                  <span className="text-slate-400">Seats:</span> {allocSeats.map(s => s.seatNumber).join(', ')}
                                </p>
                              </div>
                            </div>
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Free seats (not allocated) */}
                      {seatsWithoutAllocation.map(seat => {
                        const { status, color } = getSeatStatus(seat.id);
                        const seatType = getSeatType(seat.seatTypeId);
                        
                        return (
                          <div key={seat.id} className="section relative">
                            <div
                              className={`${color} rounded-lg border-2 p-2 transition-all hover:scale-105 hover:shadow-lg cursor-default flex flex-col items-center justify-center h-[88px] w-[60px]`}
                            >
                              {seatType.icon ? (
                                <img 
                                  src={seatType.icon} 
                                  alt={seatType.name}
                                  className="w-6 h-6 object-contain mb-1"
                                />
                              ) : (
                                <Armchair className="w-5 h-5 mb-1 text-slate-400" />
                              )}
                              <span className="text-[11px] font-semibold text-slate-700">
                                {seat.seatNumber}
                              </span>
                            </div>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 section-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                              <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[180px]">
                                <p className="font-bold text-sm mb-1">{seat.seatNumber}</p>
                                <p className="text-slate-300 mb-2">{seatType.name}</p>
                                <div className="border-t border-slate-700 pt-2">
                                  <p className="text-slate-300 italic">Available</p>
                                </div>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )
        ))}

        {/* Ungrouped Seats */}
        {ungroupedSeats.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-visible">
            <div className="bg-gradient-to-r from-slate-500 to-slate-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Ungrouped Seats</h2>
              <p className="text-slate-300 text-sm mt-1">{ungroupedSeats.length} seats</p>
            </div>
            <div className="p-6">
              {(() => {
                // Group ungrouped seats by allocation
                const seatsWithAllocation = [];
                const seatsWithoutAllocation = [];
                
                ungroupedSeats.forEach(seat => {
                  const { allocation } = getSeatStatus(seat.id);
                  if (allocation) {
                    seatsWithAllocation.push({ seat, allocation });
                  } else {
                    seatsWithoutAllocation.push(seat);
                  }
                });
                
                // Group by allocation ID
                const allocationGroups = {};
                seatsWithAllocation.forEach(({ seat, allocation }) => {
                  if (!allocationGroups[allocation.id]) {
                    allocationGroups[allocation.id] = {
                      allocation,
                      seats: []
                    };
                  }
                  allocationGroups[allocation.id].seats.push(seat);
                });
                
                return (
                  <div className="flex flex-wrap gap-y-2 gap-x-4">
                    {/* Allocated seats grouped by allocation */}
                    {Object.values(allocationGroups).map(({ allocation, seats: allocSeats }) => (
                      <div 
                        key={allocation.id}
                        className="border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-lg p-2 cursor-pointer hover:bg-blue-50/50 transition-colors inline-flex flex-col gap-2 relative section"
                        onClick={() => navigate(`/user/allocation/${allocation.id}`)}
                      >
                        <div className="flex items-center space-x-2 px-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-xs font-semibold text-slate-700">
                            {allocation.guestName} - Room {allocation.roomNumber}
                          </span>
                          {allocation.guestCategory && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {allocation.guestCategory}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-y-2 gap-x-4">
                          {allocSeats.map(seat => {
                            const { status, color, isCalling } = getSeatStatus(seat.id);
                            const seatType = getSeatType(seat.seatTypeId);
                            
                            return (
                                <div
                                  className={`${color} rounded-lg border-2 p-2 transition-all hover:scale-105 hover:shadow-lg cursor-pointer flex flex-col items-center justify-center h-[88px] w-[60px] ${
                                    isCalling ? 'animate-pulse ring-4 ring-red-500 ring-offset-2 shadow-xl shadow-red-500/50' : ''
                                  }`}
                                >
                                  {seatType.icon ? (
                                    <img 
                                      src={seatType.icon} 
                                      alt={seatType.name}
                                      className="w-6 h-6 object-contain mb-1 brightness-0 invert"
                                    />
                                  ) : (
                                    <Armchair className="w-5 h-5 mb-1 text-white" />
                                  )}
                                  <span className="text-[11px] font-semibold text-white">
                                    {seat.seatNumber}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Allocation Hover Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 opacity-0 section-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                          <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[200px]">
                            <p className="font-bold text-sm mb-1">{allocation.guestName}</p>
                            <p className="text-slate-300 mb-2">Room {allocation.roomNumber}</p>
                            <div className="border-t border-slate-700 pt-2 space-y-1">
                              <p className="font-semibold text-teal-400">Status: {allocation.status}</p>
                              {allocation.guestCategory && (
                                <p className="text-amber-400">
                                  <span className="text-slate-400">Category:</span> {allocation.guestCategory}
                                </p>
                              )}
                              <p className="text-slate-200 text-[10px] mt-1">
                                <span className="text-slate-400">Seats:</span> {allocSeats.map(s => s.seatNumber).join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Free seats (not allocated) */}
                    {seatsWithoutAllocation.map(seat => {
                      const { status, color } = getSeatStatus(seat.id);
                      const seatType = getSeatType(seat.seatTypeId);
                      
                      return (
                        <div key={seat.id} className="section relative">
                          <div
                            className={`${color} rounded-lg border-2 p-2 transition-all hover:scale-105 hover:shadow-lg cursor-default flex flex-col items-center justify-center h-[88px] w-[60px]`}
                          >
                            {seatType.icon ? (
                              <img 
                                src={seatType.icon} 
                                alt={seatType.name}
                                className="w-6 h-6 object-contain mb-1"
                              />
                            ) : (
                              <Armchair className="w-5 h-5 mb-1 text-slate-400" />
                            )}
                            <span className="text-[11px] font-semibold text-slate-700">
                              {seat.seatNumber}
                            </span>
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 section-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                            <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl min-w-[180px]">
                              <p className="font-bold text-sm mb-1">{seat.seatNumber}</p>
                              <p className="text-slate-300 mb-2">{seatType.name}</p>
                              <div className="border-t border-slate-700 pt-2">
                                <p className="text-slate-300 italic">Available</p>
                              </div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};
