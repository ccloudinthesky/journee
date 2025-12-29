import React, { useRef, useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Location, LocationType } from '../../types';
import { createAutocomplete, getPlaceDetails } from '../../services/googleMaps';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  placeholder?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = 'Search the next destination ......',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!inputRef.current) return;

    const autocomplete = createAutocomplete(inputRef.current, async (place) => {
      if (place.place_id) {
        setIsSearching(true);
        try {
          const location = await getPlaceDetails(place.place_id);
          onLocationSelect(location);
          
          // Clear input
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        } catch (error) {
          console.error('Failed to get place details:', error);
        } finally {
          setIsSearching(false);
        }
      }
    });

    return () => {
      // Cleanup autocomplete
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [onLocationSelect]);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          disabled={isSearching}
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
      {isSearching && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-lg p-4 text-center">
          <div className="text-gray-600">Loading location details...</div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;

