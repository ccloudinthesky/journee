import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, ChevronDown, X, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTrips } from '../contexts/TripContext';
import TripCard from '../components/trip/TripCard';
import { Trip } from '../types';

type FilterType = 'all' | 'week' | 'month' | 'latest';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { trips, fetchTrips, loading, createTrip } = useTrips();
  const [filter, setFilter] = useState<FilterType>('all');
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTripData, setNewTripData] = useState({
    name: '',
    coverImage: '',
    startDate: '',
    endDate: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchTrips();
  }, [isAuthenticated, navigate]);

  // Animate cards appearing one by one
  useEffect(() => {
    if (filteredTrips.length > 0) {
      setVisibleCards([]);
      // Include the add new trip card in the animation
      const totalCards = filteredTrips.length + 1;
      for (let index = 0; index < totalCards; index++) {
        setTimeout(() => {
          setVisibleCards(prev => [...prev, index]);
        }, index * 200); // 200ms delay between each card
      }
    } else {
      // If no trips, show the add new trip card immediately
      setVisibleCards([0]);
    }
  }, [filteredTrips]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let filtered = [...trips];

    switch (filter) {
      case 'week': {
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        filtered = trips.filter((trip) => {
          const startDate = new Date(trip.startDate);
          return startDate <= oneWeekFromNow;
        });
        break;
      }
      case 'month': {
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        filtered = trips.filter((trip) => {
          const startDate = new Date(trip.startDate);
          return startDate <= oneMonthFromNow;
        });
        break;
      }
      case 'latest': {
        filtered = [...trips].sort((a, b) => {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        break;
      }
      default:
        filtered = trips;
    }

    setFilteredTrips(filtered);
  }, [trips, filter]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleCreateTrip = async () => {
    if (!newTripData.name || !newTripData.startDate || !newTripData.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const tripData: any = {
        name: newTripData.name,
        startDate: newTripData.startDate,
        endDate: newTripData.endDate
      };
      
      // Only include coverImage if it's not empty
      if (newTripData.coverImage && newTripData.coverImage.trim() !== '') {
        tripData.coverImage = newTripData.coverImage;
      }
      
      const newTrip = await createTrip(tripData);
      
      // Close modal and reset form
      setShowCreateModal(false);
      setNewTripData({ name: '', coverImage: '', startDate: '', endDate: '' });
      
      // Navigate to the new trip's explore page
      navigate(`/explore/${newTrip.id}`);
    } catch (error: any) {
      console.error('Failed to create trip:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        // The API interceptor will handle the redirect
        return;
      }
      
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.response?.data?.error || (error instanceof Error ? error.message : 'Failed to create trip. Please try again.');
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading your journeys...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{
      background: 'radial-gradient(40.82% 96.62% at 30.43% 43.57%, #E0BBA9 0%, #D2D1D6 100%)'
    }}>
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Left Sidebar - Fixed */}
        <div className="w-80 flex-shrink-0 p-16 relative z-10">
          {/* Title */}
          <h1 className="text-4xl font-serif text-black/80 mb-8" style={{ 
            fontFamily: 'Crimson Text, serif',
            fontSize: '40px',
            lineHeight: '52px',
            fontWeight: 200
          }}>
            My Journey
          </h1>
          
          {/* Filter Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setFilter(filter === 'week' ? 'all' : 'week')}
              className={`inline-block text-left px-4 py-2 rounded-full border border-white transition-colors ${
                filter === 'week'
                  ? 'bg-white/20 text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              style={{ 
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '16px',
                lineHeight: '21px',
                fontWeight: 400
              }}
            >
              within a week
            </button>
            <br />
            <button
              onClick={() => setFilter(filter === 'month' ? 'all' : 'month')}
              className={`inline-block text-left px-4 py-2 rounded-full border border-white transition-colors ${
                filter === 'month'
                  ? 'bg-white/20 text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              style={{ 
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '16px',
                lineHeight: '21px',
                fontWeight: 400
              }}
            >
              within a month
            </button>
            <br />
            <button
              onClick={() => setFilter(filter === 'latest' ? 'all' : 'latest')}
              className={`inline-block text-left px-4 py-2 rounded-full border border-white transition-colors ${
                filter === 'latest'
                  ? 'bg-white/20 text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              style={{ 
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '16px',
                lineHeight: '21px',
                fontWeight: 400
              }}
            >
              latest edited
            </button>
          </div>

          {/* User Avatar */}
          <div className="absolute bottom-16 left-16" ref={userMenuRef}>
            <div 
              className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors relative"
              onClick={handleUserMenuToggle}
            >
              <UserIcon className="w-8 h-8 text-white" />
              <ChevronDown className="w-3 h-3 text-white absolute -bottom-1 -right-1" />
              
              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-50">
                  {/* User Info */}
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900" style={{ fontFamily: 'SF Compact, system-ui, sans-serif' }}>
                      {user?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500" style={{ fontFamily: 'SF Compact, system-ui, sans-serif' }}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    style={{ fontFamily: 'SF Compact, system-ui, sans-serif' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Scrollable */}
        <div className="flex-1 p-10 overflow-hidden">
          <div className="flex gap-8 h-full overflow-x-auto overflow-y-hidden pb-4">
            {filteredTrips.map((trip, index) => (
              <div
                key={trip.id}
                className={`transition-all duration-500 ease-out ${
                  visibleCards.includes(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <TripCard trip={trip} />
              </div>
            ))}
            
            {/* Add New Trip Card - Always show */}
            <div
              className={`transition-all duration-500 ease-out ${
                visibleCards.includes(filteredTrips.length)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ animationDelay: `${filteredTrips.length * 200}ms` }}
            >
              <div 
                className="relative overflow-hidden rounded-3xl shadow-lg cursor-pointer flex-shrink-0 flex items-center justify-center"
                style={{ 
                  width: '336px',
                  height: 'calc(100vh - 80px)',
                  background: 'rgba(245, 245, 245, 0.7)',
                  boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)'
                }}
                onClick={() => setShowCreateModal(true)}
              >
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md relative">
                    <span className="text-3xl text-gray-400 font-light absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">+</span>
                  </div>
                  <h3 className="text-xl font-serif text-gray-600 mb-2" style={{ 
                    fontFamily: 'Crimson Text, serif',
                    fontWeight: 400
                  }}>
                    Create New Trip
                  </h3>
                  <p className="text-sm text-gray-500" style={{ 
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '14px',
                    lineHeight: '18px'
                  }}>
                    Start planning your next adventure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Trip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gray-900" style={{ 
                fontFamily: 'Crimson Text, serif',
                fontWeight: 400
              }}>
                Create New Trip
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Trip Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Name *
                </label>
                <input
                  type="text"
                  value={newTripData.name}
                  onChange={(e) => setNewTripData({ ...newTripData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter trip name"
                  required
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <input
                  type="url"
                  value={newTripData.coverImage}
                  onChange={(e) => setNewTripData({ ...newTripData, coverImage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter image URL"
                />
                
                {/* Image Preview */}
                {newTripData.coverImage && (
                  <div className="mt-3">
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={newTripData.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newTripData.startDate}
                    onChange={(e) => setNewTripData({ ...newTripData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newTripData.endDate}
                    onChange={(e) => setNewTripData({ ...newTripData, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrip}
                disabled={isCreating || !newTripData.name || !newTripData.startDate || !newTripData.endDate}
                className="flex-1 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
                style={{
                  backgroundColor: '#EBD1C7'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#D4B5A5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#EBD1C7';
                  }
                }}
              >
                {isCreating ? 'Creating...' : 'Create Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

