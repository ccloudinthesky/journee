import React, { useState, useEffect } from 'react';
import { X, Plus, Star, MapPin } from 'lucide-react';
import { Location, LocationType } from '../../types';
import { getLocationIcon } from '../../utils/locationIcons';

interface SavedLocationsHorizontalPanelProps {
  tripId: string;
  isVisible: boolean;
  onAddToDay: (location: Location) => void;
  onClose: () => void;
  onHoverLocation?: (location: Location | null) => void;
}

const SavedLocationsHorizontalPanel: React.FC<SavedLocationsHorizontalPanelProps> = ({
  tripId,
  isVisible,
  onAddToDay,
  onClose,
  onHoverLocation,
}) => {
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [filter, setFilter] = useState<LocationType | 'all'>('all');

  // Load saved locations from backend API
  const loadSavedLocations = async () => {
    if (!tripId) {
      setSavedLocations([]);
      return;
    }
    
    try {
      // Import API at the top level
      const { savedLocationApi } = await import('../../services/api');
      const response = await savedLocationApi.getAll(tripId);
      
      if (response.success && response.data) {
        // Backend returns { locations: [...], pagination: {...} }
        const locations = Array.isArray(response.data) ? response.data : (response.data as any).locations;
        
        // Transform backend data to frontend format
        const transformedLocations = locations.map((loc: any) => ({
          id: loc.id,
          name: loc.name,
          address: loc.address,
          placeId: loc.place_id,
          coordinates: { lat: loc.lat, lng: loc.lng },
          type: loc.type,
          photoUrl: loc.photo_url,
          openingHours: loc.opening_hours,
          rating: loc.rating
        }));
        setSavedLocations(transformedLocations);
      }
    } catch (error) {
      console.error('Failed to load saved locations:', error);
      setSavedLocations([]);
    }
  };

  useEffect(() => {
    loadSavedLocations();
  }, [tripId]);

  // Listen for custom refresh events
  useEffect(() => {
    const handleRefresh = () => {
      loadSavedLocations();
    };

    window.addEventListener('savedLocationsUpdated', handleRefresh);
    return () => window.removeEventListener('savedLocationsUpdated', handleRefresh);
  }, [tripId]);

  const filteredLocations = savedLocations.filter(
    (location) => filter === 'all' || location.type === filter
  );

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-[26rem] right-6 z-40" style={{ backgroundColor: 'transparent', height: '200px' }}>
      {/* Filter Buttons - Fixed position */}
      <div className="absolute -top-1 left-0 right-0 flex gap-2 overflow-x-auto pb-2 scrollbar-hide z-50">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            filter === 'all' ? 'text-white' : 'bg-white/90 text-gray-700 shadow-md'
          }`}
          style={{
            backgroundColor: filter === 'all' ? '#C1BB41' : undefined
          }}
        >
          All
        </button>
        <button
          onClick={() => setFilter('restaurant')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            filter === 'restaurant' ? 'text-white' : 'bg-white/90 text-gray-700 shadow-md'
          }`}
          style={{
            backgroundColor: filter === 'restaurant' ? '#C1BB41' : undefined
          }}
        >
          🍽️ Restaurants
        </button>
        <button
          onClick={() => setFilter('cafe')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            filter === 'cafe' ? 'text-white' : 'bg-white/90 text-gray-700 shadow-md'
          }`}
          style={{
            backgroundColor: filter === 'cafe' ? '#C1BB41' : undefined
          }}
        >
          ☕ Cafes
        </button>
        <button
          onClick={() => setFilter('accommodation')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            filter === 'accommodation' ? 'text-white' : 'bg-white/90 text-gray-700 shadow-md'
          }`}
          style={{
            backgroundColor: filter === 'accommodation' ? '#C1BB41' : undefined
          }}
        >
          🏨 Accommodations
        </button>
        <button
          onClick={() => setFilter('attraction')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
            filter === 'attraction' ? 'text-white' : 'bg-white/90 text-gray-700 shadow-md'
          }`}
          style={{
            backgroundColor: filter === 'attraction' ? '#C1BB41' : undefined
          }}
        >
          ⭐ Attractions
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-full text-sm whitespace-nowrap bg-white/90 text-gray-700 shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Location Cards - Scrollable area */}
      <div className="absolute top-8 left-0 right-0 bottom-0 overflow-x-auto overflow-y-hidden scrollbar-hide">
        {filteredLocations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm">No saved locations yet for this trip.</p>
            <p className="text-xs mt-1">Click on map markers to save locations.</p>
          </div>
        ) : (
          <div className="flex gap-3 pb-2">
          {filteredLocations.map((location) => {
            const LocationIcon = getLocationIcon(location.type);
            
            return (
              <div
                key={location.id}
                className="flex-shrink-0 w-60 h-40 bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between"
                onMouseEnter={() => onHoverLocation && onHoverLocation(location)}
                onMouseLeave={() => onHoverLocation && onHoverLocation(null)}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <LocationIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="font-semibold truncate text-base text-gray-900">
                      {location.name}
                    </h3>
                  </div>
                  <p className="text-xs mb-2 line-clamp-2 text-gray-600">
                    {location.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAddToDay(location)}
                    className="flex-1 flex items-center justify-center gap-1 text-white px-3 py-2 rounded-md text-sm hover:opacity-90 transition-colors"
                    style={{ backgroundColor: '#E0BBA9' }}
                  >
                    <Plus className="w-4 h-4" />
                    Add to Day
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // Remove from backend via API
                        const { savedLocationApi } = await import('../../services/api');
                        await savedLocationApi.delete(location.id);
                        
                        // Update local state
                        setSavedLocations(savedLocations.filter((loc) => loc.id !== location.id));
                      } catch (error) {
                        console.error('Failed to delete saved location:', error);
                        alert('Failed to remove location from collection');
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    title="Remove from collection"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedLocationsHorizontalPanel;