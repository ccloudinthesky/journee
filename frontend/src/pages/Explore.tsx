import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ChevronLeft } from 'lucide-react';
import { useTrips } from '../contexts/TripContext';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import GoogleMap from '../components/map/GoogleMap';
import SimpleMap from '../components/map/SimpleMap';
import LocationCard from '../components/location/LocationCard';
import TripEditMenu from '../components/trip/TripEditMenu';
import TripSidebar from '../components/trip/TripSidebar';
import LocationPopup from '../components/map/LocationPopup';
import SavedLocationsHorizontalPanel from '../components/location/SavedLocationsHorizontalPanel';
import { Location, LocationType } from '../types';
import { getLocationIcon } from '../utils/locationIcons';
import { Search, MapPin, Star } from 'lucide-react';
import { searchPlaces } from '../services/googleMaps';

const Explore: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { currentTrip, fetchTrip, addLocationToDay, removeLocationFromDay, reorderLocationsInDay, updateTrip, deleteTrip } = useTrips();
  const { isLoaded, loadError } = useGoogleMaps();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<LocationType | 'all'>('all');
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [showSavedLocationsPanel, setShowSavedLocationsPanel] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState<Location[]>([]);
  const [isMapSearching, setIsMapSearching] = useState(false);
  const [searchResultMarker, setSearchResultMarker] = useState<google.maps.Marker | null>(null);
  const [isInDayView, setIsInDayView] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'overview' | 'day-edit'>('overview');
  
  const handleDayChange = useCallback((index: number) => {
    setCurrentDayIndex(index);
    // Ensure we're in day-edit mode when changing days
    if (sidebarMode !== 'day-edit') {
      setSidebarMode('day-edit');
      setIsInDayView(true);
    }
  }, [sidebarMode]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (tripId) {
      fetchTrip(tripId);
    }
  }, [tripId, fetchTrip]);

  // Ensure sidebar is shown when trip is loaded
  useEffect(() => {
    if (currentTrip && !showSidebar) {
      setShowSidebar(true);
    }
  }, [currentTrip, showSidebar]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !currentTrip) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Case 1: Dragging within the same day (reordering)
    if (activeData?.type === 'location' && overData?.type === 'location') {
      const activeLocation = activeData.location as Location;
      
      // Find which day contains these locations
      const day = currentTrip.days.find((d) =>
        d.locations.some((loc) => loc.id === active.id)
      );

      if (day) {
        const oldIndex = day.locations.findIndex((loc) => loc.id === active.id);
        const newIndex = day.locations.findIndex((loc) => loc.id === over.id);

        if (oldIndex !== newIndex) {
          const newLocations = arrayMove(day.locations, oldIndex, newIndex);
          reorderLocationsInDay(currentTrip.id, day.day, newLocations);
        }
      }
    }

    // Case 2: Dragging to a day container (adding new location)
    if (overData?.type === 'day') {
      const dayNumber = overData.dayNumber;
      
      // If dragging from search results (new location)
      if (activeData?.type === 'searchResult') {
        const location = activeData.location as Location;
        addLocationToDay(currentTrip.id, dayNumber, location);
      }
    }
  };


  const handleLocationSelect = async (location: Location) => {
    // Save location to localStorage for later use
    const savedLocations = JSON.parse(localStorage.getItem('savedLocations') || '[]');
    const exists = savedLocations.some((loc: Location) => loc.id === location.id);
    if (!exists) {
      savedLocations.push(location);
      localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
    }
    
    // Add to first day by default, or let user drag it
    if (currentTrip && currentTrip.days.length > 0) {
      addLocationToDay(currentTrip.id, currentTrip.days[0].day, location);
    }
  };

  const handleEditTripName = (newName: string) => {
    if (currentTrip) {
      updateTrip(currentTrip.id, { name: newName });
    }
  };

  const handleEditTripImage = (newImage: string) => {
    if (currentTrip) {
      updateTrip(currentTrip.id, { coverImage: newImage });
    }
  };

  const handleDeleteTrip = () => {
    if (currentTrip) {
      deleteTrip(currentTrip.id);
      navigate('/home');
    }
  };

  const handleLocationClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    setShowLocationPopup(true);
  }, []);

  const handleSaveToCollection = async (location: Location) => {
    if (!tripId) return;
    
    try {
      // Save location to backend via API
      const { savedLocationApi } = await import('../services/api');
      await savedLocationApi.create({
        tripId: tripId,
        name: location.name,
        address: location.address,
        placeId: location.placeId || location.id,
        coordinates: location.coordinates,
        type: location.type,
        photoUrl: location.photoUrl,
        openingHours: location.openingHours,
        rating: location.rating
      });
      console.log('Explore: Saved location to collection for trip', tripId, ':', location.name);
      
      // Trigger refresh event for SavedLocationsHorizontalPanel
      window.dispatchEvent(new Event('savedLocationsUpdated'));
    } catch (error) {
      console.error('Failed to save location:', error);
      alert('Failed to save location to collection');
    }
  };

  const handleMapSearch = async (query: string) => {
    if (!query.trim()) {
      setMapSearchResults([]);
      return;
    }

    setIsMapSearching(true);
    try {
      const results = await searchPlaces(query, mapInstance || undefined);
      // Convert PlaceSearchResult to Location format
      const locations: Location[] = results.map((result) => ({
        id: result.placeId,
        name: result.name,
        address: result.address,
        coordinates: result.coordinates,
        type: result.type,
        rating: result.rating,
        photoUrl: result.photoUrl,
        placeId: result.placeId
      }));
      setMapSearchResults(locations);
    } catch (error) {
      console.error('Map search failed:', error);
      setMapSearchResults([]);
    } finally {
      setIsMapSearching(false);
    }
  };

  const getCurrentDayLocations = useMemo((): Location[] => {
    if (!currentTrip || currentTrip.days.length === 0) {
      return [];
    }
    return currentTrip.days[currentDayIndex]?.locations || [];
  }, [currentTrip, currentDayIndex]);

  const getAllLocations = useMemo((): Location[] => {
    if (!currentTrip) {
      return [];
    }
    const locations = currentTrip.days.flatMap((day) => day.locations);
    return locations;
  }, [currentTrip]);

  // Track which saved location is hovered, to highlight on the map
  const [hoverSavedLocation, setHoverSavedLocation] = useState<Location | null>(null);
  
  // Track which location in sidebar is hovered
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);


  // Update isInDayView based on TripSidebar mode
  // Show numbers only when in day-edit mode
  const handleModeChange = useCallback((mode: 'overview' | 'day-edit') => {
    console.log('Mode changed to:', mode);
    setSidebarMode(mode);
    setIsInDayView(mode === 'day-edit');
  }, []);

  const getActiveLocation = (): Location | null => {
    if (!activeId || !currentTrip) return null;
    
    for (const day of currentTrip.days) {
      const location = day.locations.find((loc) => loc.id === activeId);
      if (location) return location;
    }
    return null;
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load Google Maps</p>
          <p className="text-sm text-gray-600">Please check your API key configuration</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!tripId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No trip selected</p>
          <button
            onClick={() => navigate('/home')}
            className="text-primary-500 hover:text-primary-600"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Loading trip...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content - Map */}
          <main className="flex-1 relative">
            {/* Map Search Bar */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Where to go?"
                  value={mapSearchQuery}
                  onChange={(e) => setMapSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleMapSearch(mapSearchQuery);
                    }
                  }}
                  className="w-80 pl-10 pr-12 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                />
                <button
                  onClick={() => handleMapSearch(mapSearchQuery)}
                  disabled={isMapSearching}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {isMapSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  ) : (
                    <Search className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Map Search Results */}
            {mapSearchResults.length > 0 && (
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30 bg-white rounded-lg shadow-lg max-w-md w-full max-h-60 overflow-y-auto">
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Search Results</h3>
                  {mapSearchResults.map((location) => (
                    <div
                      key={location.id}
                      className="p-2 hover:bg-gray-50 rounded cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSelectedLocation(location);
                        setShowLocationPopup(true);
                        setMapSearchResults([]);
                        setMapSearchQuery('');
                        
                        // Move map to the selected location
                        if (mapInstance) {
                          // Clear previous search result marker
                          if (searchResultMarker) {
                            searchResultMarker.setMap(null);
                          }
                          
                          // Create a new marker for the search result
                          const marker = new google.maps.Marker({
                            position: {
                              lat: location.coordinates.lat,
                              lng: location.coordinates.lng
                            },
                            map: mapInstance,
                            title: location.name,
                            icon: {
                              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                              scaledSize: new google.maps.Size(32, 32)
                            }
                          });
                          
                          setSearchResultMarker(marker);
                          
                          // Move map to the location
                          mapInstance.setCenter({
                            lat: location.coordinates.lat,
                            lng: location.coordinates.lng
                          });
                          mapInstance.setZoom(15); // Set appropriate zoom level
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {location.name}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {location.address}
                          </p>
                        </div>
                        {location.rating && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{location.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <SimpleMap
              locations={isInDayView ? getCurrentDayLocations : getAllLocations}
              onLocationClick={handleLocationClick}
              onMapReady={setMapInstance}
              showNumbers={isInDayView}
              highlightLocation={hoveredLocation || hoverSavedLocation}
            />

          </main>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="w-80">
            <LocationCard location={getActiveLocation()!} isDragging={true} />
          </div>
        ) : null}
      </DragOverlay>

      {/* Trip Sidebar */}
      <TripSidebar
        tripId={tripId || ''}
        trip={currentTrip}
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        currentDayIndex={currentDayIndex}
        onDayChange={handleDayChange}
        onShowSavedLocations={() => setShowSavedLocationsPanel(true)}
        onModeChange={handleModeChange}
        showSavedLocationsPanel={showSavedLocationsPanel} // Add this prop
        onLocationHover={setHoveredLocation}
      />

      {/* Location Popup */}
      <LocationPopup
        location={selectedLocation}
        isOpen={showLocationPopup}
        onClose={() => {
          setShowLocationPopup(false);
          // Clear search result marker when closing popup
          if (searchResultMarker) {
            searchResultMarker.setMap(null);
            setSearchResultMarker(null);
          }
        }}
        onSaveToCollection={handleSaveToCollection}
        onAddToDay={(location) => {
          if (currentTrip && currentTrip.days.length > 0) {
            addLocationToDay(currentTrip.id, currentTrip.days[currentDayIndex].day, location);
          }
        }}
        map={mapInstance}
        tripId={tripId}
      />

      {/* Saved Locations Horizontal Panel */}
      <SavedLocationsHorizontalPanel
        tripId={tripId || ''}
        isVisible={showSavedLocationsPanel}
        onAddToDay={(location) => {
          if (currentTrip && currentTrip.days.length > 0) {
            addLocationToDay(currentTrip.id, currentTrip.days[currentDayIndex].day, location);
          }
        }}
        onClose={() => setShowSavedLocationsPanel(false)}
        onHoverLocation={setHoverSavedLocation}
      />
    </DndContext>
  );
};

// Category Filter Button Component
interface CategoryButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      style={{
        backgroundColor: active ? '#EBD1C7' : undefined
      }}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
};

export default Explore;

