import { Client } from '@googlemaps/google-maps-services-js';
import { config } from '../config/env';
import { PlaceSearchResult, GeocodeResult } from '../types';
import { createError } from '../middleware/errorHandler';

const client = new Client({});

// Places API - Text Search
export const searchPlaces = async (
  query: string,
  location?: { lat: number; lng: number },
  radius?: number
): Promise<PlaceSearchResult[]> => {
  try {
    const request: any = {
      params: {
        query,
        key: config.googleMapsApiKey,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types', 'rating', 'photos', 'opening_hours', 'formatted_phone_number']
      }
    };

    // Add location bias if provided
    if (location) {
      request.params.location = `${location.lat},${location.lng}`;
      request.params.radius = radius || 50000; // 50km default radius
    }

    const response = await client.textSearch(request);

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw createError(`Google Places API error: ${response.data.status}`, 500);
    }

    return response.data.results?.map((place) => ({
      placeId: place.place_id!,
      name: place.name!,
      address: place.formatted_address!,
      coordinates: {
        lat: place.geometry!.location!.lat,
        lng: place.geometry!.location!.lng
      },
      type: mapGooglePlaceType(place.types?.[0] || 'attraction'),
      rating: place.rating,
      photoUrl: place.photos?.[0] ? getPhotoUrl(place.photos[0].photo_reference!) : undefined,
      openingHours: place.opening_hours?.open_now ? 'Open now' : 'Hours not available'
    })) || [];

  } catch (error) {
    console.error('Google Places API error:', error);
    throw createError('Failed to search places', 500);
  }
};

// Places API - Nearby Search
export const searchNearbyPlaces = async (
  location: { lat: number; lng: number },
  radius: number = 1000,
  type?: string
): Promise<PlaceSearchResult[]> => {
  try {
    const request: any = {
      params: {
        location: `${location.lat},${location.lng}`,
        radius,
        key: config.googleMapsApiKey,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types', 'rating', 'photos', 'opening_hours', 'formatted_phone_number']
      }
    };

    if (type) {
      request.params.type = type;
    }

    const response = await client.placesNearby(request);

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw createError(`Google Places API error: ${response.data.status}`, 500);
    }

    return response.data.results?.map((place) => ({
      placeId: place.place_id!,
      name: place.name!,
      address: place.vicinity || place.formatted_address || 'Address not available',
      coordinates: {
        lat: place.geometry!.location!.lat,
        lng: place.geometry!.location!.lng
      },
      type: mapGooglePlaceType(place.types?.[0] || 'attraction'),
      rating: place.rating,
      photoUrl: place.photos?.[0] ? getPhotoUrl(place.photos[0].photo_reference!) : undefined,
      openingHours: place.opening_hours?.open_now ? 'Open now' : 'Hours not available'
    })) || [];

  } catch (error) {
    console.error('Google Places Nearby API error:', error);
    throw createError('Failed to search nearby places', 500);
  }
};

// Places API - Place Details
export const getPlaceDetails = async (placeId: string): Promise<PlaceSearchResult | null> => {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: config.googleMapsApiKey,
        fields: ['place_id', 'name', 'formatted_address', 'geometry', 'types', 'rating', 'photos', 'opening_hours', 'formatted_phone_number', 'website']
      }
    });

    if (response.data.status !== 'OK') {
      throw createError(`Google Places Details API error: ${response.data.status}`, 500);
    }

    const place = response.data.result;
    if (!place) {
      return null;
    }

    return {
      placeId: place.place_id!,
      name: place.name!,
      address: place.formatted_address!,
      coordinates: {
        lat: place.geometry!.location!.lat,
        lng: place.geometry!.location!.lng
      },
      type: mapGooglePlaceType(place.types?.[0] || 'attraction'),
      rating: place.rating,
      photoUrl: place.photos?.[0] ? getPhotoUrl(place.photos[0].photo_reference!) : undefined,
      openingHours: formatOpeningHours(place.opening_hours)
    };

  } catch (error) {
    console.error('Google Places Details API error:', error);
    throw createError('Failed to get place details', 500);
  }
};

// Geocoding API - Address to Coordinates
export const geocodeAddress = async (address: string): Promise<GeocodeResult[]> => {
  try {
    const response = await client.geocode({
      params: {
        address,
        key: config.googleMapsApiKey
      }
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw createError(`Google Geocoding API error: ${response.data.status}`, 500);
    }

    return response.data.results?.map((result) => ({
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address
    })) || [];

  } catch (error) {
    console.error('Google Geocoding API error:', error);
    throw createError('Failed to geocode address', 500);
  }
};

// Reverse Geocoding API - Coordinates to Address
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodeResult[]> => {
  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: config.googleMapsApiKey
      }
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw createError(`Google Reverse Geocoding API error: ${response.data.status}`, 500);
    }

    return response.data.results?.map((result) => ({
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address
    })) || [];

  } catch (error) {
    console.error('Google Reverse Geocoding API error:', error);
    throw createError('Failed to reverse geocode coordinates', 500);
  }
};

// Helper function to map Google Place types to our types
const mapGooglePlaceType = (googleType: string): 'restaurant' | 'cafe' | 'accommodation' | 'attraction' => {
  const typeMapping: { [key: string]: 'restaurant' | 'cafe' | 'accommodation' | 'attraction' } = {
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'meal_takeaway': 'restaurant',
    'meal_delivery': 'restaurant',
    'cafe': 'cafe',
    'bakery': 'cafe',
    'lodging': 'accommodation',
    'hotel': 'accommodation',
    'motel': 'accommodation',
    'hostel': 'accommodation',
    'tourist_attraction': 'attraction',
    'museum': 'attraction',
    'park': 'attraction',
    'zoo': 'attraction',
    'aquarium': 'attraction',
    'amusement_park': 'attraction',
    'art_gallery': 'attraction',
    'church': 'attraction',
    'mosque': 'attraction',
    'synagogue': 'attraction',
    'hindu_temple': 'attraction',
    'shopping_mall': 'attraction',
    'store': 'attraction'
  };

  return typeMapping[googleType] || 'attraction';
};

// Helper function to get photo URL
const getPhotoUrl = (photoReference: string, maxWidth: number = 400): string => {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${config.googleMapsApiKey}`;
};

// Helper function to format opening hours
const formatOpeningHours = (openingHours: any): string => {
  if (!openingHours || !openingHours.weekday_text) {
    return 'Hours not available';
  }

  const today = new Date().getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[today];

  const todayHours = openingHours.weekday_text.find((day: string) => 
    day.startsWith(todayName)
  );

  return todayHours || 'Hours not available';
};
