import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Clock, Plus } from 'lucide-react';
import { Location, LocationType } from '../../types';
import { getLocationIcon } from '../../utils/locationIcons';

interface SavedLocationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToDay: (location: Location, dayNumber: number) => void;
  currentDay: number;
}

const SavedLocationsPanel: React.FC<SavedLocationsPanelProps> = ({
  isOpen,
  onClose,
  onAddToDay,
  currentDay,
}) => {
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [filter, setFilter] = useState<LocationType | 'all'>('all');

  // Load saved locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedLocations');
    if (saved) {
      setSavedLocations(JSON.parse(saved));
    }
  }, []);

  const filteredLocations = savedLocations.filter(
    (location) => filter === 'all' || location.type === filter
  );

  const handleAddToDay = (location: Location) => {
    onAddToDay(location, currentDay);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Saved Locations</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('restaurant')}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === 'restaurant'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              🍽️ Restaurants
            </button>
            <button
              onClick={() => setFilter('cafe')}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === 'cafe'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              ☕ Cafes
            </button>
            <button
              onClick={() => setFilter('accommodation')}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === 'accommodation'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              🏨 Hotels
            </button>
            <button
              onClick={() => setFilter('attraction')}
              className={`px-4 py-2 rounded-full text-sm ${
                filter === 'attraction'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              ⭐ Attractions
            </button>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location) => {
              const LocationIcon = getLocationIcon(location.type);
              return (
                <div
                  key={location.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <LocationIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {location.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {location.address}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                        {location.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{location.rating}</span>
                          </div>
                        )}
                        {location.openingHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="truncate">{location.openingHours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToDay(location)}
                      className="flex-shrink-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                      title="Add to Day"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredLocations.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No saved locations found</p>
              <p className="text-sm text-gray-400 mt-2">
                Search for places and save them to your collection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedLocationsPanel;
