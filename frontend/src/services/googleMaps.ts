import { Location, LocationType, PlaceSearchResult } from '../types';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
}

let googleMapsLoaded = false;
let loadingPromise: Promise<void> | null = null;
let placesService: google.maps.places.PlacesService | null = null;
let directionsService: google.maps.DirectionsService | null = null;
let directionsRenderer: google.maps.DirectionsRenderer | null = null;

/**
 * Load Google Maps API using script tag method
 */
export const loadGoogleMaps = async (): Promise<void> => {
  if (googleMapsLoaded) return Promise.resolve();
  if (loadingPromise) return loadingPromise;
  
  console.log('🔍 Loading Google Maps API...');
  console.log('🔑 API Key:', API_KEY ? `Set (${API_KEY.length} chars)` : 'Not set');
  console.log('🔑 API Key preview:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'None');
  
  if (!API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  loadingPromise = new Promise((resolve, reject) => {
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      googleMapsLoaded = true;
      console.log('✅ Google Maps API already loaded');
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('⚠️ Google Maps script already exists, waiting for load...');
      // Wait for the existing script to load
      const checkLoaded = () => {
        if (typeof google !== 'undefined' && google.maps) {
          googleMapsLoaded = true;
          console.log('✅ Google Maps API loaded from existing script');
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Create script tag to load Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry,marker&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Set up global callback
    (window as any).initGoogleMaps = () => {
      googleMapsLoaded = true;
      console.log('✅ Google Maps API loaded successfully via script tag');
      resolve();
    };

    script.onerror = (error) => {
      console.error('❌ Error loading Google Maps API:', error);
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
  
  return loadingPromise;
};

/**
 * Initialize Places Service
 */
export const initPlacesService = (map: google.maps.Map): void => {
  placesService = new google.maps.places.PlacesService(map);
};

/**
 * Initialize Directions Service
 */
export const initDirectionsService = (): void => {
  directionsService = new google.maps.DirectionsService();
};

/**
 * Initialize Directions Renderer
 */
export const initDirectionsRenderer = (map: google.maps.Map): google.maps.DirectionsRenderer => {
  directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: true, // We'll use custom markers
    polylineOptions: {
      strokeColor: '#0ea5e9',
      strokeWeight: 4,
      strokeOpacity: 0.8,
    },
  });
  return directionsRenderer;
};

/**
 * Search for places using text query
 */
export const searchPlaces = (
  query: string,
  map?: google.maps.Map,
  location?: google.maps.LatLngLiteral
): Promise<PlaceSearchResult[]> => {
  return new Promise((resolve, reject) => {
    // Create a temporary PlacesService if map is provided
    const service = map ? new google.maps.places.PlacesService(map) : placesService;
    
    if (!service) {
      reject(new Error('Places service not initialized. Please provide a map instance.'));
      return;
    }

    const request: google.maps.places.TextSearchRequest = {
      query,
      ...(location && { location: new google.maps.LatLng(location.lat, location.lng), radius: 50000 }),
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places: PlaceSearchResult[] = results.map((place) => ({
          placeId: place.place_id || '',
          name: place.name || '',
          address: place.formatted_address || '',
          coordinates: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          },
          type: determineLocationType(place.types),
          rating: place.rating,
          photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400 }),
          openingHours: place.opening_hours?.isOpen() ? 'Open now' : 'Closed',
        }));
        resolve(places);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
};

/**
 * Get place details by place ID
 */
export const getPlaceDetails = (placeId: string): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!placesService) {
      reject(new Error('Places service not initialized'));
      return;
    }

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId,
      fields: ['name', 'formatted_address', 'geometry', 'types', 'rating', 'photos', 'opening_hours', 'formatted_phone_number'],
    };

    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        const location: Location = {
          id: crypto.randomUUID(),
          placeId,
          name: place.name || '',
          address: place.formatted_address || '',
          coordinates: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
          },
          type: determineLocationType(place.types),
          rating: place.rating,
          photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 800 }),
          openingHours: place.opening_hours?.weekday_text?.join(', '),
          phoneNumber: place.formatted_phone_number,
        };
        resolve(location);
      } else {
        reject(new Error(`Place details failed: ${status}`));
      }
    });
  });
};

/**
 * Calculate route via backend API (Phase 2)
 * For now, we'll just show markers without routes
 */
export const calculateRoute = async (
  locations: Location[]
): Promise<void> => {
  // TODO: Call backend API with server key for Directions API
  console.log('Route calculation will be handled by backend in Phase 2');
  console.log('Locations:', locations.map(l => l.name));
};

/**
 * Calculate distance between two locations
 */
export const calculateDistance = (
  from: google.maps.LatLngLiteral,
  to: google.maps.LatLngLiteral
): number => {
  const fromLatLng = new google.maps.LatLng(from.lat, from.lng);
  const toLatLng = new google.maps.LatLng(to.lat, to.lng);
  
  return google.maps.geometry.spherical.computeDistanceBetween(fromLatLng, toLatLng);
};

/**
 * Determine location type from Google Places types
 */
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

/**
 * Create autocomplete instance
 */
export const createAutocomplete = (
  input: HTMLInputElement,
  onPlaceChanged: (place: google.maps.places.PlaceResult) => void
): google.maps.places.Autocomplete => {
  const autocomplete = new google.maps.places.Autocomplete(input, {
    fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types', 'rating', 'photos', 'opening_hours'],
  });

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place) {
      onPlaceChanged(place);
    }
  });

  return autocomplete;
};

/**
 * Fit map bounds to show all markers
 */
export const fitBounds = (
  map: google.maps.Map,
  locations: Location[]
): void => {
  if (locations.length === 0) return;

  const bounds = new google.maps.LatLngBounds();
  locations.forEach((location) => {
    bounds.extend(
      new google.maps.LatLng(location.coordinates.lat, location.coordinates.lng)
    );
  });

  map.fitBounds(bounds);
  
  // If only one location, set a reasonable zoom level
  if (locations.length === 1) {
    map.setZoom(14);
  }
};

