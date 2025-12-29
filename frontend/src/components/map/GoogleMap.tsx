import React, { useEffect, useRef, useState } from 'react';
import { Location } from '../../types';
import {
  initPlacesService,
  initDirectionsRenderer,
  calculateRoute,
  fitBounds,
} from '../../services/googleMaps';

interface GoogleMapProps {
  locations: Location[];
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onMapClick?: (location: google.maps.LatLngLiteral) => void;
  showRoute?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  locations,
  center = { lat: 25.0330, lng: 121.5654 }, // Taipei default
  zoom = 11, // Slightly wider view of Taipei
  onMapClick,
  showRoute = true,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    // Initialize services
    initPlacesService(newMap);
    const renderer = initDirectionsRenderer(newMap);
    setDirectionsRenderer(renderer);

    // Add click listener
    if (onMapClick) {
      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });
    }

    setMap(newMap);
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    // Create new markers
    const newMarkers = locations.map((location, index) => {
      const marker = new google.maps.Marker({
        position: location.coordinates,
        map,
        title: location.name,
        // Disable canvas optimization to reduce flicker while panning
        optimized: false,
        label: {
          text: (index + 1).toString(),
          color: 'white',
          fontWeight: 'bold',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getMarkerColor(location.type),
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
        },
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${location.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #666;">${location.address}</p>
            ${location.rating ? `<p style="margin: 0; font-size: 13px;">⭐ ${location.rating}</p>` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (locations.length > 0) {
      fitBounds(map, locations);
    }
  }, [map, locations]);

  // Update route when locations change
  useEffect(() => {
    if (!map || !directionsRenderer || !showRoute || locations.length < 2) {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
        directionsRenderer.setMap(map);
      }
      return;
    }

    calculateRoute(locations)
      .then((result) => {
        console.log('Route calculated:', result);
      })
      .catch((error) => {
        console.error('Failed to calculate route:', error);
      });
  }, [map, directionsRenderer, locations, showRoute]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" />
  );
};

// Helper function to get marker color based on location type
const getMarkerColor = (type: string): string => {
  switch (type) {
    case 'restaurant':
      return '#8b86be'; // Soft purple-blue
    case 'cafe':
      return '#ecb761'; // Amber/golden
    case 'accommodation':
      return '#cbd690'; // Soft green
    case 'attraction':
      return '#86abba'; // Soft blue
    default:
      return '#6b7280'; // Gray
  }
};

export default GoogleMap;

