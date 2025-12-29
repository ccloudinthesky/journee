import { Router, Request, Response } from 'express';
import { searchPlaces, searchNearbyPlaces, getPlaceDetails, geocodeAddress, reverseGeocode } from '../services/googleMaps';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, PlaceSearchResult, GeocodeResult } from '../types';

const router = Router();

// Search places by text query
router.get('/search', optionalAuth, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { query, lat, lng, radius = 50000 } = req.query;

  if (!query || typeof query !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Query parameter is required'
    });
    return;
  }

  const location = lat && lng ? { lat: Number(lat), lng: Number(lng) } : undefined;
  const searchRadius = Number(radius);

  const results = await searchPlaces(query, location, searchRadius);

  const response: ApiResponse<PlaceSearchResult[]> = {
    success: true,
    data: results,
    message: 'Places search completed'
  };

  res.json(response);
}));

// Search nearby places
router.get('/nearby', optionalAuth, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius = 1000, type } = req.query;

  if (!lat || !lng) {
    res.status(400).json({
      success: false,
      error: 'Latitude and longitude parameters are required'
    });
    return;
  }

  const location = { lat: Number(lat), lng: Number(lng) };
  const searchRadius = Number(radius);
  const placeType = type as string | undefined;

  const results = await searchNearbyPlaces(location, searchRadius, placeType);

  const response: ApiResponse<PlaceSearchResult[]> = {
    success: true,
    data: results,
    message: 'Nearby places search completed'
  };

  res.json(response);
}));

// Get place details by place ID
router.get('/details/:placeId', optionalAuth, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { placeId } = req.params;

  const result = await getPlaceDetails(placeId);

  if (!result) {
    res.status(404).json({
      success: false,
      error: 'Place not found'
    });
    return;
  }

  const response: ApiResponse<PlaceSearchResult> = {
    success: true,
    data: result,
    message: 'Place details retrieved'
  };

  res.json(response);
}));

// Geocode address to coordinates
router.get('/geocode', optionalAuth, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Address parameter is required'
    });
    return;
  }

  const results = await geocodeAddress(address);

  const response: ApiResponse<GeocodeResult[]> = {
    success: true,
    data: results,
    message: 'Address geocoded successfully'
  };

  res.json(response);
}));

// Reverse geocode coordinates to address
router.get('/reverse-geocode', optionalAuth, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    res.status(400).json({
      success: false,
      error: 'Latitude and longitude parameters are required'
    });
    return;
  }

  const results = await reverseGeocode(Number(lat), Number(lng));

  const response: ApiResponse<GeocodeResult[]> = {
    success: true,
    data: results,
    message: 'Coordinates reverse geocoded successfully'
  };

  res.json(response);
}));

export default router;
