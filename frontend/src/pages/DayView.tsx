import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTrips } from '../contexts/TripContext';
import { Location } from '../types';
import SimpleMap from '../components/map/SimpleMap';
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
import SortableLocationCard from '../components/trip/SortableLocationCard';

const DayView: React.FC = () => {
  const navigate = useNavigate();
  const { tripId } = useParams<{ tripId: string }>();
  const { trips, updateTrip } = useTrips();
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showSavedLocations, setShowSavedLocations] = useState(false);

  const trip = trips.find((t) => t.id === tripId);
  const currentDay = trip?.days[currentDayIndex];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!trip || !currentDay) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip not found</h1>
          <button
            onClick={() => navigate('/home')}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = currentDay.locations.findIndex((loc) => loc.id === active.id);
    const newIndex = currentDay.locations.findIndex((loc) => loc.id === over.id);

    if (oldIndex !== newIndex) {
      const newLocations = arrayMove(currentDay.locations, oldIndex, newIndex);
      const updatedTrip = {
        ...trip,
        days: trip.days.map((day, index) =>
          index === currentDayIndex ? { ...day, locations: newLocations } : day
        ),
      };
      updateTrip(tripId!, updatedTrip);
    }
  };

  const handleRemoveLocation = (locationId: string) => {
    const updatedTrip = {
      ...trip,
      days: trip.days.map((day, index) =>
        index === currentDayIndex
          ? {
              ...day,
              locations: day.locations.filter((loc) => loc.id !== locationId),
            }
          : day
      ),
    };
    updateTrip(tripId!, updatedTrip);
  };

  const handleAddToDay = (location: Location) => {
    const updatedTrip = {
      ...trip,
      days: trip.days.map((day, index) =>
        index === currentDayIndex
          ? {
              ...day,
              locations: [...day.locations, location],
            }
          : day
      ),
    };
    updateTrip(tripId!, updatedTrip);
    setShowSavedLocations(false);
  };

  const goToPreviousDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const goToNextDay = () => {
    if (currentDayIndex < trip.days.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {trip.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {formatDate(currentDay.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousDay}
                disabled={currentDayIndex === 0}
                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-500 px-2">
                {currentDayIndex + 1} of {trip.days.length}
              </span>
              <button
                onClick={goToNextDay}
                disabled={currentDayIndex === trip.days.length - 1}
                className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Day Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Day {currentDayIndex + 1} Schedule
              </h2>
              <button
                onClick={() => setShowSavedLocations(true)}
                className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={currentDay.locations.map((loc) => loc.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {currentDay.locations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No locations added yet</p>
                      <p className="text-sm mt-2">
                        Click "Add Location" to get started
                      </p>
                    </div>
                  ) : (
                    currentDay.locations.map((location, index) => (
                      <SortableLocationCard
                        key={location.id}
                        location={location}
                        index={index}
                        onRemove={() => handleRemoveLocation(location.id)}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Map View */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Map View</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <SimpleMap
                locations={currentDay.locations}
                showNumbers={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
