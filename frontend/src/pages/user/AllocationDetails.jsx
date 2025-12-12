import React, { useState, useEffect } from 'react';
import { UserLayout } from '../../components/user/UserLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, Calendar, User, Armchair, Activity, Clock, 
  TrendingUp, Phone, PhoneOff, CheckCircle, Timer 
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

export const AllocationDetails = () => {
  const { allocationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [allocation, setAllocation] = useState(null);
  const [seats, setSeats] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAllocationDetails();
  }, [allocationId]);

  const fetchAllocationDetails = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      const propertyId = parsedUser.entityId;

      // Fetch allocation
      const allocResponse = await axios.get(`${BACKEND_URL}/api/allocations/${propertyId}`);
      if (allocResponse.data.success) {
        const foundAllocation = allocResponse.data.allocations.find(a => a.id === allocationId);
        if (foundAllocation) {
          setAllocation(foundAllocation);
          calculateAnalytics(foundAllocation);
        } else {
          toast({
            title: "Error",
            description: "Allocation not found",
            variant: "destructive"
          });
          navigate('/user/allocation');
        }
      }

      // Fetch seats
      const seatsResponse = await axios.get(`${BACKEND_URL}/api/seats/${propertyId}`);
      if (seatsResponse.data.success) {
        setSeats(seatsResponse.data.seats);
      }

      // Fetch staff
      const staffResponse = await axios.get(`${BACKEND_URL}/api/staff/${propertyId}`);
      if (staffResponse.data.success) {
        setStaff(staffResponse.data.staff);
      }
    } catch (error) {
      console.error('Error fetching allocation details:', error);
      toast({
        title: "Error",
        description: "Failed to load allocation details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (alloc) => {
    const events = alloc.events || [];
    const createdAt = new Date(alloc.createdAt);
    const now = new Date();
    
    // Total allocation time (from creation to now or completion)
    const completedEvent = events.find(e => e.eventType === "Status Change" && e.newValue === "Complete");
    const endTime = completedEvent ? new Date(completedEvent.timestamp) : now;
    const totalTimeMs = endTime - createdAt;
    const totalTimeSeconds = Math.floor(totalTimeMs / 1000);
    const totalTimeHours = Math.floor(totalTimeSeconds / 3600);
    const totalTimeMinutes = Math.floor((totalTimeSeconds % 3600) / 60);
    const totalTimeRemainderSeconds = totalTimeSeconds % 60;
    
    // Count calling events
    const callingOnEvents = events.filter(e => e.eventType === "Calling On");
    const callingOffEvents = events.filter(e => e.eventType === "Calling Off");
    const callingCount = callingOnEvents.length;
    
    // Calculate average calling time
    let totalCallingTime = 0;
    let callingDurations = [];
    
    for (let i = 0; i < callingOnEvents.length; i++) {
      const onEvent = callingOnEvents[i];
      const onTime = new Date(onEvent.timestamp);
      
      // Find the next calling off event after this on event
      const offEvent = callingOffEvents.find(off => new Date(off.timestamp) > onTime);
      
      if (offEvent) {
        const offTime = new Date(offEvent.timestamp);
        const duration = offTime - onTime;
        callingDurations.push(duration);
        totalCallingTime += duration;
      } else if (alloc.callingFlag !== "Non Calling") {
        // Still calling, calculate duration till now
        const duration = now - onTime;
        callingDurations.push(duration);
        totalCallingTime += duration;
      }
    }
    
    const avgCallingTimeSeconds = callingCount > 0 ? Math.floor(totalCallingTime / callingCount / 1000) : 0;
    const avgCallingTimeMinutes = Math.floor(avgCallingTimeSeconds / 60);
    const avgCallingTimeRemainderSeconds = avgCallingTimeSeconds % 60;
    
    const totalCallingSeconds = Math.floor(totalCallingTime / 1000);
    const totalCallingMinutes = Math.floor(totalCallingSeconds / 60);
    const totalCallingRemainderSeconds = totalCallingSeconds % 60;
    
    // Calculate active time (time in "Active" status)
    const activeStartEvent = events.find(e => e.eventType === "Status Change" && e.newValue === "Active");
    let activeTimeSeconds = 0;
    
    if (activeStartEvent) {
      const activeStartTime = new Date(activeStartEvent.timestamp);
      
      // Find when it left Active status
      const activeEndEvent = events.find(e => 
        e.eventType === "Status Change" && 
        e.oldValue === "Active" &&
        new Date(e.timestamp) > activeStartTime
      );
      
      const activeEndTime = activeEndEvent ? new Date(activeEndEvent.timestamp) : 
        (alloc.status === "Active" ? now : activeStartTime);
      
      activeTimeSeconds = Math.floor((activeEndTime - activeStartTime) / 1000);
    }
    
    const activeTimeMinutes = Math.floor(activeTimeSeconds / 60);
    const activeTimeRemainderSeconds = activeTimeSeconds % 60;
    
    // Status change count
    const statusChangeCount = events.filter(e => e.eventType === "Status Change").length;
    
    setAnalytics({
      totalTime: { hours: totalTimeHours, minutes: totalTimeMinutes, seconds: totalTimeRemainderSeconds },
      callingCount,
      avgCallingTime: { minutes: avgCallingTimeMinutes, seconds: avgCallingTimeRemainderSeconds },
      totalCallingTime: { minutes: totalCallingMinutes, seconds: totalCallingRemainderSeconds },
      activeTime: { minutes: activeTimeMinutes, seconds: activeTimeRemainderSeconds },
      statusChangeCount,
      callingDurations
    });
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "Created":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "Status Change":
        return <Activity className="w-5 h-5 text-purple-500" />;
      case "Calling On":
        return <Phone className="w-5 h-5 text-red-500" />;
      case "Calling Off":
        return <PhoneOff className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Allocated': 'bg-blue-100 text-blue-700 border-blue-300',
      'Active': 'bg-green-100 text-green-700 border-green-300',
      'Billing': 'bg-purple-100 text-purple-700 border-purple-300',
      'Clear': 'bg-teal-100 text-teal-700 border-teal-300',
      'Complete': 'bg-slate-100 text-slate-700 border-slate-300'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getSeatNumbers = () => {
    if (!allocation || !seats.length) return [];
    return allocation.seatIds
      .map(seatId => {
        const seat = seats.find(s => s.id === seatId);
        return seat ? seat.seatNumber : seatId;
      })
      .join(', ');
  };

  const getFBManagerName = () => {
    if (!allocation || !staff.length) return 'N/A';
    const manager = staff.find(s => s.id === allocation.fbManagerId);
    return manager ? manager.name : 'N/A';
  };

  const getPoolBeachAttendantNames = () => {
    if (!allocation || !staff.length || !allocation.poolBeachAttendantIds?.length) return [];
    return allocation.poolBeachAttendantIds
      .map(id => {
        const attendant = staff.find(s => s.id === id);
        return attendant ? attendant.name : null;
      })
      .filter(name => name !== null);
  };

  const getFBServerNames = () => {
    if (!allocation || !staff.length || !allocation.fbServerIds?.length) return [];
    return allocation.fbServerIds
      .map(id => {
        const server = staff.find(s => s.id === id);
        return server ? server.name : null;
      })
      .filter(name => name !== null);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading allocation details...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!allocation) {
    return (
      <UserLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Allocation not found</p>
          <Button onClick={() => navigate('/user/allocation')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Allocations
          </Button>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/user/allocation')}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Allocation Details</h1>
              <p className="text-slate-600 mt-1">Complete timeline and analytics</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${getStatusColor(allocation.status)}`}>
            {allocation.status}
          </div>
        </div>

        {/* Guest Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Guest Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <p className="text-sm text-slate-600">Guest Name</p>
                <p className="font-semibold text-slate-800">{allocation.guestName}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <p className="text-sm text-slate-600">Room Number</p>
                <p className="font-semibold text-slate-800">{allocation.roomNumber}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Armchair className="w-5 h-5 text-green-500 mt-1" />
              <div>
                <p className="text-sm text-slate-600">Seats</p>
                <p className="font-semibold text-slate-800">{getSeatNumbers() || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-orange-500 mt-1" />
              <div>
                <p className="text-sm text-slate-600">F&B Manager</p>
                <p className="font-semibold text-slate-800">{getFBManagerName()}</p>
              </div>
            </div>
            {allocation.guestCategory && (
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-amber-500 mt-1" />
                <div>
                  <p className="text-sm text-slate-600">Category</p>
                  <p className="font-semibold text-amber-600">{allocation.guestCategory}</p>
                </div>
              </div>
            )}
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-teal-500 mt-1" />
              <div>
                <p className="text-sm text-slate-600">Allocation Date</p>
                <p className="font-semibold text-slate-800">
                  {new Date(allocation.createdAt).toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Timer className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total Time</p>
              <p className="text-3xl font-bold">
                {analytics.totalTime.hours}h {analytics.totalTime.minutes}m {analytics.totalTime.seconds}s
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Phone className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Calling Count</p>
              <p className="text-3xl font-bold">{analytics.callingCount}</p>
              <p className="text-xs opacity-75 mt-1">times pressed</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Avg Calling Time</p>
              <p className="text-3xl font-bold">{analytics.avgCallingTime.minutes}m {analytics.avgCallingTime.seconds}s</p>
              <p className="text-xs opacity-75 mt-1">per call</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Active Time</p>
              <p className="text-3xl font-bold">{analytics.activeTime.minutes}m {analytics.activeTime.seconds}s</p>
              <p className="text-xs opacity-75 mt-1">in Active status</p>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-md p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-sm opacity-90 mb-1">Status Changes</p>
              <p className="text-3xl font-bold">{analytics.statusChangeCount}</p>
              <p className="text-xs opacity-75 mt-1">transitions</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Event Timeline
          </h2>
          
          {allocation.events && allocation.events.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              
              <div className="space-y-6">
                {[...allocation.events].reverse().map((event, index) => (
                  <div key={index} className="relative pl-14">
                    {/* Icon */}
                    <div className="absolute left-0 top-0 w-12 h-12 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      {getEventIcon(event.eventType)}
                    </div>
                    
                    {/* Content */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-800">{event.eventType}</h3>
                        <span className="text-xs text-slate-500">{formatTime(event.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                      {event.oldValue && event.newValue && (
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="bg-slate-200 px-2 py-1 rounded text-slate-700">
                            {event.oldValue}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="bg-blue-100 px-2 py-1 rounded text-blue-700 font-medium">
                            {event.newValue}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No events recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};
