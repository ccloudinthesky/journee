import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Location, LocationType } from '../../types';

interface SimpleMapProps {
  locations: Location[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onLocationClick?: (location: Location) => void;
  onMapReady?: (map: google.maps.Map) => void;
  showNumbers?: boolean; // Add prop to control number display
  highlightLocation?: Location | null; // Location to temporarily highlight
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  locations,
  center = { lat: 25.0330, lng: 121.5654 }, // Taipei default
  zoom = 11, // Slightly wider view of Taipei
  onLocationClick,
  onMapReady,
  showNumbers = false, // Default to false
  highlightLocation = null,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const highlightMarkerRef = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedBounds = useRef(false);
  const previousLocationsSignature = useRef<string | null>(null);
  
  // Memoize locations to prevent unnecessary re-renders
  const memoizedLocations = useMemo(() => locations, [locations]);
  const memoizedShowNumbers = useMemo(() => showNumbers, [showNumbers]);
  // no-op

  // Initialize map only once
  useEffect(() => {
    if (!mapRef.current || map) return;

    try {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        // Keep POI clickable but we'll handle the clicks ourselves
      });

      setMap(newMap);
      setError(null);
      
      // Notify parent component that map is ready
      if (onMapReady) {
        onMapReady(newMap);
      }
      
      // Create a global InfoWindow to prevent default POI InfoWindows
      const globalInfoWindow = new google.maps.InfoWindow();
      globalInfoWindow.close(); // Keep it closed
      
      // Override the default POI click behavior immediately
      newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
        // Always close any open InfoWindows first
        globalInfoWindow.close();
        
        // Only handle POI clicks, not custom marker clicks
        if ((event as any).placeId && onLocationClick) {
          // Prevent default InfoWindow and stop event propagation
          event.stop();
          if (event.domEvent) {
            event.domEvent.stopPropagation();
            event.domEvent.preventDefault();
          }
          
          // Prevent default InfoWindow by immediately closing it
          setTimeout(() => {
            globalInfoWindow.close();
          }, 0);
          
          // This is a POI click, we need to get the place details
          // Use only the old PlacesService API for better compatibility
          const service = new google.maps.places.PlacesService(newMap);
          service.getDetails({
            placeId: (event as any).placeId,
            fields: ['name', 'formatted_address', 'rating', 'opening_hours', 'photos', 'place_id', 'geometry', 'types']
          }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              // Determine location type from Google Places types
              const determineLocationType = (types?: string[]): LocationType => {
                if (!types) return 'attraction';

                // Restaurant types
                if (types.includes('restaurant') || 
                    types.includes('food') || 
                    types.includes('meal_takeaway') || 
                    types.includes('meal_delivery') ||
                    types.includes('bakery') ||
                    types.includes('bar') ||
                    types.includes('night_club')) {
                  return 'restaurant';
                }
                
                // Cafe types
                if (types.includes('cafe') || 
                    types.includes('coffee_shop') ||
                    types.includes('coffee')) {
                  return 'cafe';
                }
                
                // Accommodation types
                if (types.includes('lodging') || 
                    types.includes('hotel') ||
                    types.includes('hostel') ||
                    types.includes('campground')) {
                  return 'accommodation';
                }
                
                // Everything else is an attraction
                return 'attraction';
              };

              const location: Location = {
                id: place.place_id || '',
                name: place.name || 'Unknown Place',
                address: place.formatted_address || '',
                coordinates: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0
                },
                type: determineLocationType(place.types), // Use proper type detection
                rating: place.rating,
                openingHours: place.opening_hours?.weekday_text?.join(', '),
                photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400, maxHeight: 300 }),
                placeId: (event as any).placeId
              };
              if (onLocationClick) {
                onLocationClick(location);
              }
            }
          });
        }
      });
    } catch (err) {
      setError('Failed to initialize map');
    }
  }, []); // Only run once on mount

  // Update markers when locations change
  useEffect(() => {
    if (!map || !memoizedLocations) return;

    // Filter out locations without valid coordinates
    const validLocations = memoizedLocations.filter(
      (location) => location.coordinates && 
      typeof location.coordinates.lat === 'number' && 
      typeof location.coordinates.lng === 'number'
    );

    // Only recreate markers if locations actually changed (by ID, not just order)
    const needsMarkerUpdate = markersRef.current.length !== validLocations.length ||
      markersRef.current.some((marker, index) => {
        const location = validLocations[index];
        return !location || 
          marker.getPosition()?.lat() !== location.coordinates.lat ||
          marker.getPosition()?.lng() !== location.coordinates.lng ||
          marker.getTitle() !== location.name; // Check if location changed
      });

    if (needsMarkerUpdate) {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      const newMarkers: google.maps.Marker[] = [];
      validLocations.forEach((location, index) => {
        const marker = new google.maps.Marker({
          position: location.coordinates,
          map,
          title: location.name,
          // Disable canvas-based optimization to prevent flicker while dragging
          optimized: false,
          label: memoizedShowNumbers ? {
            text: (index + 1).toString(),
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
          } : undefined,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: getMarkerColor(location.type),
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          },
        });

        // Attach id for quick lookup when highlighting
        (marker as any).locationId = location.id;

        marker.addListener('click', (event: google.maps.MapMouseEvent) => {
          // Stop event propagation to prevent map click handler
          event.stop();
          if (event.domEvent) {
            event.domEvent.stopPropagation();
            event.domEvent.preventDefault();
          }
          
          // Close any open InfoWindows
          const globalInfoWindow = new google.maps.InfoWindow();
          globalInfoWindow.close();
          
          if (onLocationClick) {
            onLocationClick(location);
          }
        });

        newMarkers.push(marker);
      });

      markersRef.current = newMarkers;
    }
  }, [map, memoizedLocations]);

  // Highlight a single location temporarily (e.g., when hovering a saved card)
  useEffect(() => {
    if (!map) return;

    // Clear previous highlight
    if (highlightMarkerRef.current) {
      highlightMarkerRef.current.setMap(null);
      highlightMarkerRef.current = null;
    }

    if (!highlightLocation) {
      // Reset z-index of all markers when not highlighting
      markersRef.current.forEach((marker) => {
        const previousZ = (marker as any).originalZIndex;
        if (previousZ !== undefined) {
          marker.setZIndex(previousZ);
          delete (marker as any).originalZIndex;
        }
      });
      return;
    }

    // Pan/zoom map to ensure highlighted location is visible
    const bounds = map.getBounds();
    if (bounds && bounds.contains(highlightLocation.coordinates)) {
      // Already visible, just pan slightly
      map.panTo(highlightLocation.coordinates);
    } else {
      // Not visible, center and zoom
      map.setCenter(highlightLocation.coordinates);
      map.setZoom(14);
    }

    // Try to find existing scheduled marker and highlight it (without bounce)
    const scheduledMarker = markersRef.current.find((m) => (m as any).locationId === highlightLocation.id);
    if (scheduledMarker) {
      // Store original z-index if not already stored
      if ((scheduledMarker as any).originalZIndex === undefined) {
        (scheduledMarker as any).originalZIndex = scheduledMarker.getZIndex();
      }
      scheduledMarker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1000);
      return;
    }

    // Otherwise, create a temporary highlight marker
    const marker = new google.maps.Marker({
      position: highlightLocation.coordinates,
      map,
      title: highlightLocation.name,
      zIndex: google.maps.Marker.MAX_ZINDEX + 1000,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#E0673F',
        fillOpacity: 0.6,
        strokeColor: '#E0673F',
        strokeWeight: 3,
      },
      optimized: false,
    });
    highlightMarkerRef.current = marker;

    return () => {
      if (highlightMarkerRef.current) {
        highlightMarkerRef.current.setMap(null);
        highlightMarkerRef.current = null;
      }
      // Reset z-index of all markers when effect cleanup runs
      markersRef.current.forEach((marker) => {
        const previousZ = (marker as any).originalZIndex;
        if (previousZ !== undefined) {
          marker.setZIndex(previousZ);
          delete (marker as any).originalZIndex;
        }
      });
    };
  }, [map, highlightLocation]);

  // Update marker labels when showNumbers changes (without recreating markers)
  useEffect(() => {
    if (!map || markersRef.current.length === 0) return;

    markersRef.current.forEach((marker, index) => {
      if (memoizedShowNumbers) {
        marker.setLabel({
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
        });
      } else {
        marker.setLabel(null);
      }
    });
  }, [map, memoizedShowNumbers]);

  // Update marker labels when locations order changes (for drag and drop)
  useEffect(() => {
    if (!map || markersRef.current.length === 0 || !memoizedShowNumbers) return;

    // Filter out locations without valid coordinates
    const validLocations = memoizedLocations.filter(
      (location) => location.coordinates && 
      typeof location.coordinates.lat === 'number' && 
      typeof location.coordinates.lng === 'number'
    );

    // Only update labels if the number of markers matches locations
    if (markersRef.current.length === validLocations.length) {
      markersRef.current.forEach((marker, index) => {
        marker.setLabel({
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
        });
      });
    }
  }, [map, memoizedLocations, memoizedShowNumbers]);

  // If the set of locations changes (e.g., switching trips), allow one-time refit
  useEffect(() => {
    // Create a stable signature based on ids and coordinates
    const signature = memoizedLocations
      .filter((l) => l.coordinates && typeof l.coordinates.lat === 'number' && typeof l.coordinates.lng === 'number')
      .map((l) => `${l.id}:${l.coordinates.lat.toFixed(5)},${l.coordinates.lng.toFixed(5)}`)
      .sort()
      .join('|');
    if (previousLocationsSignature.current !== signature) {
      previousLocationsSignature.current = signature;
      hasInitializedBounds.current = false;
    }
  }, [memoizedLocations]);

  // Separate effect for bounds initialization to prevent re-execution
  useEffect(() => {
    if (!map || !memoizedLocations.length || hasInitializedBounds.current) return;
    
    // Filter out locations without valid coordinates
    const validLocations = memoizedLocations.filter(
      (location) => location.coordinates && 
      typeof location.coordinates.lat === 'number' && 
      typeof location.coordinates.lng === 'number'
    );

    if (validLocations.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    validLocations.forEach((location) => {
      bounds.extend(
        new google.maps.LatLng(location.coordinates.lat, location.coordinates.lng)
      );
    });
    
    // Use a timeout to prevent black flash during rapid updates
    const timeoutId = setTimeout(() => {
      // Add padding to make room for the sidebar and prevent markers from being cut off
      map.fitBounds(bounds, {
        left: 400,  // For the sidebar (376px + 24px margin)
        top: 50,    // For top spacing
        bottom: 50, // For bottom spacing
      });
      hasInitializedBounds.current = true;
      
      if (validLocations.length === 1) {
        map.setZoom(14);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [map, memoizedLocations]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-2">Map Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
};

// Helper function to get marker color based on location type
const getMarkerColor = (type: string): string => {
  switch (type) {
    case 'restaurant':
      return '#bf8ed4'; // Soft purple-blue
    case 'cafe':
      return '#eec824'; // Amber/golden
    case 'accommodation':
      return '#6a961f'; // Soft green
    case 'attraction':
      return '#a0dfdf'; // Soft blue
    default:
      return '#6b7280'; // Gray
  }
};

export default SimpleMap;
