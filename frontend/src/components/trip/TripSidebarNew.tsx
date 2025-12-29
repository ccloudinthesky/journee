import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../../contexts/TripContext';
import { Location } from '../../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LocationCard from '../location/LocationCard';
import TripHeader from './TripHeader';
import TripEditModal from './TripEditModal';
import DayPreview from './DayPreview';
import DayEditHeader from './DayEditHeader';

interface SortableLocationCardProps {
  location: Location;
  index: number;
  onRemove: () => void;
}

const SortableLocationCard: React.FC<SortableLocationCardProps> = ({
  location,
  index,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: location.id,
    // Prevent layout animation on drop to avoid the brief visual revert
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    // Keep transforms smooth for neighbors, but avoid animating the active item back
    transition: isDragging ? 'transform 0ms' : transition,
  };

  const handleRemove = () => {
    console.log('SortableLocationCard: Remove button clicked for:', location.id);
    onRemove();
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LocationCard
        location={location}
        index={index}
        showRemove={true}
        onRemove={handleRemove}
        isDragging={isDragging}
      />
    </div>
  );
};

interface TripSidebarProps {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  currentDayIndex: number;
  onDayChange: (index: number) => void;
  onShowSavedLocations?: () => void;
  onModeChange?: (mode: SidebarMode) => void;
}

type SidebarMode = 'overview' | 'day-edit';

const TripSidebar: React.FC<TripSidebarProps> = ({
  tripId,
  isOpen,
  onClose,
  currentDayIndex,
  onDayChange,
  onShowSavedLocations,
  onModeChange,
}) => {
  const navigate = useNavigate();
  const { trips, updateTrip } = useTrips();
  const [mode, setMode] = useState<SidebarMode>('overview');
  const [showEditModal, setShowEditModal] = useState(false);

  // Notify parent component when mode changes
  useEffect(() => {
    if (onModeChange) {
      onModeChange(mode);
    }
  }, [mode]); // Remove onModeChange from dependencies to prevent infinite re-renders

  const trip = trips.find((t) => t.id === tripId);
  const currentDay = trip?.days[currentDayIndex];
  // Maintain a local copy of locations for instant, flicker-free reordering
  const [localLocations, setLocalLocations] = useState<Location[]>([]);
  const isReorderingRef = useRef(false);

  // Sync local locations whenever the day changes (or external data updates)
  useEffect(() => {
    const incoming = currentDay?.locations ?? [];
    if (isReorderingRef.current) {
      const localIds = (localLocations || []).map((l) => l.id).join('|');
      const incomingIds = incoming.map((l) => l.id).join('|');
      if (incomingIds !== localIds) {
        // Wait for external state to catch up to local
        return;
      }
      isReorderingRef.current = false;
    }
    setLocalLocations(incoming);
  }, [currentDay, localLocations]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
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
    const updatedDays = trip.days.map((d, idx) =>
      idx === currentDayIndex ? { ...d, locations: newLocations } : d
    );
    
    console.log('Updating trip with new locations:', newLocations.map(l => l.name));
    
    isReorderingRef.current = true;
    updateTrip(trip.id, { days: updatedDays });
  };

  const handleRemoveLocation = (locationId: string) => {
    if (!trip) {
      console.log('No trip found for removal');
      return;
    }
    
    console.log('Removing location:', locationId, 'from trip:', trip.id, 'day:', currentDayIndex);
    
    const updatedDays = trip.days.map((day, index) =>
      index === currentDayIndex
        ? {
            ...day,
            locations: day.locations.filter((loc) => loc.id !== locationId),
          }
        : day
    );
    
    console.log('Updated days:', updatedDays);
    
    // Only remove from trip schedule, NOT from saved locations
    // Saved locations should be managed separately
    updateTrip(trip.id, { days: updatedDays });
  };

  const handleEditTrip = () => {
    console.log('handleEditTrip called');
    setShowEditModal(true);
  };

  const handleSaveTrip = (updates: { name: string; coverImage: string; startDate: string; endDate: string }) => {
    console.log('Saving trip updates:', updates);
    if (trip) {
      updateTrip(trip.id, updates);
      setShowEditModal(false);
    }
  };

  const handleAddSchedule = () => {
    // Show saved locations panel on the right instead of changing mode
    if (onShowSavedLocations) {
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
      <div
        className={`fixed left-6 top-6 bottom-6 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: '400px', // 增加寬度
          background: '#FFFFFF',
          boxShadow: '4px 4px 4px rgba(0, 0, 0, 0.25)',
          borderRadius: '24px',
          zIndex: 40,
          overflow: 'hidden' // 確保內容不會超出圓角邊界
        }}
      >
        <div className="flex flex-col h-full">
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
          ) : (
            <TripHeader
              trip={trip}
              onEditTrip={handleEditTrip}
              onAddSchedule={() => {}} // Empty function since we removed the button
              onBack={handleBack}
            />
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {mode === 'overview' && (
              <div className="space-y-6">
                {trip.days.map((day, index) => (
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={() => {
                  // Set CSS variable to disable transitions
                  document.documentElement.style.setProperty('--dnd-transition-duration', '0ms');
                }}
                onDragEnd={(event) => {
                  // Reset CSS variable after drag
                  document.documentElement.style.setProperty('--dnd-transition-duration', '');
                  // Call the main drag end handler
                  handleDragEnd(event);
                }}
              >
                <SortableContext
                  items={(localLocations || []).map((loc) => loc.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {(localLocations || []).map((location, index) => (
                      <SortableLocationCard
                        key={location.id}
                        location={location}
                        index={index}
                        onRemove={() => handleRemoveLocation(location.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
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
      />
    </>
  );
};

export default TripSidebar;