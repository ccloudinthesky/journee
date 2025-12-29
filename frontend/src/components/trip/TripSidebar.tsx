import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../../contexts/TripContext';
import { Location } from '../../types';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import TripHeader from './TripHeader';
import TripEditModal from './TripEditModal';
import DayPreview from './DayPreview';
import DayEditHeader from './DayEditHeader';
import DayEditLocations from './DayEditLocations';


interface TripSidebarProps {
  tripId: string;
  trip: any; // Pass the trip directly instead of looking it up
  isOpen: boolean;
  onClose: () => void;
  currentDayIndex: number;
  onDayChange: (index: number) => void;
  onShowSavedLocations?: () => void;
  onModeChange?: (mode: SidebarMode) => void;
  showSavedLocationsPanel?: boolean; // Add this prop to track panel state
  onLocationHover?: (location: Location | null) => void; // Callback for location hover
}

type SidebarMode = 'overview' | 'day-edit';

const TripSidebar: React.FC<TripSidebarProps> = ({
  tripId,
  trip,
  isOpen,
  onClose,
  currentDayIndex,
  onDayChange,
  onShowSavedLocations,
  onModeChange,
  showSavedLocationsPanel = false, // Add this prop with default value
  onLocationHover,
}) => {
  const navigate = useNavigate();
  const { updateTrip, reorderLocationsInDay, removeLocationFromDay, deleteTrip } = useTrips();
  const [mode, setMode] = useState<SidebarMode>('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  // Notify parent component when mode changes
  useEffect(() => {
    if (onModeChange) {
      onModeChange(mode);
    }
  }, [mode]); // Remove onModeChange from dependencies to prevent infinite re-renders

  const currentDay = trip?.days[currentDayIndex];
  // Maintain a local copy of locations for instant, flicker-free reordering
  const [localLocations, setLocalLocations] = useState<Location[]>([]);
  const isReorderingRef = useRef(false);
  const [isSavedLocationsOpen, setIsSavedLocationsOpen] = useState(false);
  const [hoverLocation, setHoverLocation] = useState<Location | null>(null);

  // Reset saved locations open state when sidebar closes or day changes
  useEffect(() => {
    if (!isOpen) {
      setIsSavedLocationsOpen(false);
    }
  }, [isOpen]);

  // Reset saved locations open state when day changes
  useEffect(() => {
    setIsSavedLocationsOpen(false);
  }, [currentDayIndex]);

  // Sync with parent's showSavedLocationsPanel state
  useEffect(() => {
    setIsSavedLocationsOpen(showSavedLocationsPanel);
  }, [showSavedLocationsPanel]);

  // Sync local locations whenever the day changes (or external data updates)
  useEffect(() => {
    const incoming = currentDay?.locations ?? [];
    if (isReorderingRef.current) {
      const localIds = (localLocations || []).map((l) => l.id).join('|');
      const incomingIds = incoming.map((l: Location) => l.id).join('|');
      if (incomingIds !== localIds) {
        // Wait for external state to catch up to local
      return;
    }
      isReorderingRef.current = false;
    }
    setLocalLocations(incoming);
  }, [currentDay, localLocations]);


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    console.log('Drag ended:', { 
      active: active.id, 
      over: over?.id, 
      currentDay: currentDay?.day,
      hasTrip: !!trip,
      hasCurrentDay: !!currentDay,
      locationsCount: currentDay?.locations.length
    });

    if (!over || !trip || !currentDay) {
      console.log('Early return - missing data');
      return;
    }

    if (active.id === over.id) {
      console.log('Early return - same item');
      return;
    }

    const oldIndex = localLocations.findIndex((loc) => loc.id === active.id);
    const newIndex = localLocations.findIndex((loc) => loc.id === over.id);

    console.log('Reordering:', { oldIndex, newIndex, currentDayIndex });

    if (oldIndex === -1 || newIndex === -1) {
      console.log('Early return - invalid indices');
      return;
    }

    if (oldIndex === newIndex) {
      console.log('Early return - same position');
      return;
    }

    const newLocations = arrayMove(localLocations, oldIndex, newIndex);
    // Optimistically update UI first to avoid any bounce-back animation
    setLocalLocations(newLocations);
    
    console.log('Updating trip with new locations:', newLocations.map(l => l.name));
    
    isReorderingRef.current = true;
    
    // Use the correct API to reorder locations
    const dayNumber = currentDayIndex + 1; // Convert 0-based index to 1-based day number
    
    try {
      await reorderLocationsInDay(trip.id, dayNumber, newLocations);
      console.log('Successfully reordered locations');
    } catch (error) {
      console.error('Failed to reorder locations:', error);
      // Revert the local state on error
      setLocalLocations(localLocations);
    }
  };

  const handleRemoveLocation = async (locationId: string) => {
    if (!trip) {
      console.log('No trip found for removal');
      return;
    }
    
    console.log('Removing location:', locationId, 'from trip:', trip.id, 'day:', currentDayIndex + 1);
    
    try {
      // Call the API to remove the location
      await removeLocationFromDay(trip.id, currentDayIndex + 1, locationId);
      console.log('Location removed successfully');
    } catch (error) {
      console.error('Failed to remove location:', error);
    }
  };

  const handleEditTrip = () => {
    console.log('handleEditTrip called');
    setShowEditModal(true);
  };

  const handleSaveTrip = (updates: { name: string; coverImage: string; startDate: string; endDate: string }) => {
    console.log('Saving trip updates:', updates);
    if (trip) {
      // Only include coverImage if it's not empty
      const tripUpdates: any = {
        name: updates.name,
        startDate: updates.startDate,
        endDate: updates.endDate
      };
      
      if (updates.coverImage && updates.coverImage.trim() !== '') {
        tripUpdates.coverImage = updates.coverImage;
      }
      
      updateTrip(trip.id, tripUpdates);
      setShowEditModal(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (trip) {
      try {
        await deleteTrip(trip.id);
        // Navigate back to home page after successful deletion
        navigate('/home');
      } catch (error) {
        console.error('Failed to delete trip:', error);
        // You could add a toast notification here
      }
    }
  };

  const handleAddSchedule = () => {
    // Show saved locations panel on the right instead of changing mode
    if (onShowSavedLocations) {
      setIsSavedLocationsOpen(true);
      onShowSavedLocations();
    }
  };

  const goToPreviousDay = () => {
    if (currentDayIndex > 0) {
      onDayChange(currentDayIndex - 1);
    }
  };

  const goToNextDay = () => {
    if (trip && currentDayIndex < trip.days.length - 1) {
      onDayChange(currentDayIndex + 1);
    }
  };

  const handleBackToOverview = () => {
    setMode('overview');
  };

  const handleBack = () => {
    if (mode === 'day-edit') {
      handleBackToOverview();
    } else {
      navigate('/home');
    }
  };

  if (!trip) {
    return null;
  }

  return (
    <>
      {/* Sidebar Container with Background Image */}
      <div
        className={`fixed left-6 top-6 bottom-6 w-80 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '376px',
          background: mode === 'overview' ? 'transparent' : '#FFFFFF',
          boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)',
          borderRadius: '24px',
          zIndex: 40,
          overflow: 'hidden'
        }}
      >
        {/* Background Image - Only show in overview mode */}
        {mode === 'overview' && (
          <div className="absolute inset-0">
            <img
              src={trip.coverImage}
              alt={trip.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log('Image failed to load:', trip.coverImage);
                e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        )}
        
        {/* Header Content Overlay - Fixed at Top - Only show in overview mode */}
        {mode === 'overview' && (
          <div className="absolute top-20 left-0 right-0 flex flex-col items-center justify-center text-center z-10 px-6">
            <h1 
              className="text-3xl font-semibold text-white mb-3"
              style={{ 
                fontFamily: 'Crimson Text, serif',
                fontWeight: 600,
                fontSize: '48px',
                lineHeight: '42px'
              }}
            >
              {trip.name}
            </h1>
            
            <p 
              className="text-white text-sm"
              style={{ 
                fontFamily: 'SF Compact, system-ui, sans-serif',
                fontWeight: 556,
                fontSize: '14px',
                lineHeight: '17px'
              }}
            >
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div 
          className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            mode === 'overview' 
              ? 'bg-white/30 hover:bg-white/40' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          style={{ zIndex: 100 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBack();
          }}
        >
          <ChevronLeft className={`w-4 h-4 ${mode === 'overview' ? 'text-white' : 'text-gray-600'}`} />
        </div>

        <div 
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            mode === 'overview' 
              ? 'bg-white/30 hover:bg-white/40' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          style={{ zIndex: 100 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowEditModal(true);
          }}
        >
          <MoreHorizontal className={`w-4 h-4 ${mode === 'overview' ? 'text-white' : 'text-gray-600'}`} />
            </div>

        <div className="flex flex-col h-full relative z-20">
          {/* Conditional Header */}
          {mode === 'day-edit' ? (
            <DayEditHeader
              trip={trip}
              currentDayIndex={currentDayIndex}
              onBack={handleBack}
              onPreviousDay={goToPreviousDay}
              onNextDay={goToNextDay}
              onAddSchedule={handleAddSchedule}
              onDayChange={onDayChange}
            />
          ) : null}

          {/* Content Area */}
          <div className={`flex-1 overflow-y-auto px-6 pb-6 ${mode === 'overview' ? 'pt-48' : 'pt-6'}`}>
          {mode === 'overview' && (
              <div className="space-y-6">
                {trip.days.map((day: any, index: number) => (
                  <DayPreview
                      key={day.day}
                    dayNumber={index + 1}
                    date={day.date}
                    locations={day.locations}
                      onClick={() => {
                        onDayChange(index);
                        setMode('day-edit');
                      }}
                  />
                ))}
              </div>
          )}


          {mode === 'day-edit' && (
            <>
              <div className="mt-2">
                <DayEditLocations
                  locations={localLocations || []}
                  onDragEnd={handleDragEnd}
                  onRemoveLocation={handleRemoveLocation}
                  onLocationHover={onLocationHover}
                />
              </div>
              
              {/* Add Schedule Button - Moved to bottom */}
              <div className="mt-6">
                <button
                  onClick={handleAddSchedule}
                  className="w-full py-3 px-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: isSavedLocationsOpen ? '#D1D5DB' : '#FDF2F0', // 灰色或淺色底
                    borderColor: isSavedLocationsOpen ? '#9CA3AF' : '#E0653B', // 灰色或橘色邊框
                    color: isSavedLocationsOpen ? '#FFFFFF' : '#E0653B', // 白色或橘色文字
                    fontFamily: 'IBM Plex Mono',
                    fontWeight: 500,
                    fontSize: '16px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSavedLocationsOpen) {
                      e.currentTarget.style.backgroundColor = '#E0653B';
                      e.currentTarget.style.color = '#FDF2F0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSavedLocationsOpen) {
                      e.currentTarget.style.backgroundColor = '#FDF2F0';
                      e.currentTarget.style.color = '#E0653B';
                    }
                  }}
                >
                  <Plus className="w-5 h-5" />
                  Add Schedule
                </button>
              </div>
            </>
                )}
              </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TripEditModal
        trip={trip}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveTrip}
        onDelete={handleDeleteTrip}
      />
    </>
  );
};

export default TripSidebar;