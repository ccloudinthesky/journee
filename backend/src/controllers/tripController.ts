import { Request, Response } from 'express';
import { database } from '../config/database';
import { ApiResponse, Trip, DaySchedule, SavedLocation, CreateTripRequest, UpdateTripRequest, CreateSavedLocationRequest } from '../types';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Helper function to get trip by ID with all details
const getTripById = async (id: string, userId: string): Promise<Trip> => {
  const trip = await database.get(
    `SELECT * FROM trips WHERE id = ? AND user_id = ? AND deleted = 0`,
    [id, userId]
  ) as Trip | undefined;

  if (!trip) {
    throw createError('Trip not found', 404);
  }

  // Get day schedules and locations
  const daySchedules = await database.all(
    `SELECT * FROM day_schedules WHERE trip_id = ? ORDER BY day_number, position`,
    [trip.id]
  ) as DaySchedule[];

  // Group by day number
  const daysMap = new Map<number, SavedLocation[]>();
  
  for (const daySchedule of daySchedules) {
    const location = await database.get(
      `SELECT * FROM saved_locations WHERE id = ?`,
      [daySchedule.saved_location_id]
    ) as SavedLocation | undefined;

    if (location) {
      // Convert database fields to frontend format
      const locationWithCoordinates = {
        ...location,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        }
      };
      
      if (!daysMap.has(daySchedule.day_number)) {
        daysMap.set(daySchedule.day_number, []);
      }
      daysMap.get(daySchedule.day_number)!.push(locationWithCoordinates);
    }
  }

  // Convert to array format - generate all days from start to end date
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const days = [];
  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayNumber - 1);
    
    // Get locations for this day if they exist
    const dayLocations = daysMap.get(dayNumber) || [];
    
    days.push({
      day: dayNumber,
      date: dayDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      locations: dayLocations
    });
  }

  const tripWithDetails = {
    ...trip,
    coverImage: trip.cover_image, // Convert snake_case to camelCase
    startDate: trip.start_date, // Convert snake_case to camelCase
    endDate: trip.end_date, // Convert snake_case to camelCase
    days
  };

  return tripWithDetails;
};

// Get all trips for current user
export const getTrips = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const trips = await database.all(
    `SELECT * FROM trips WHERE user_id = ? AND deleted = 0 ORDER BY created_at DESC`,
    [req.user.id]
  ) as Trip[];

  // Get day schedules and locations for each trip
  const tripsWithDetails = await Promise.all(
    trips.map(async (trip) => {
      // Get all day schedules for this trip
      const daySchedules = await database.all(
        `SELECT * FROM day_schedules WHERE trip_id = ? ORDER BY day_number, position`,
        [trip.id]
      ) as DaySchedule[];

      // Group by day number
      const daysMap = new Map<number, SavedLocation[]>();
      
      for (const daySchedule of daySchedules) {
        const location = await database.get(
          `SELECT * FROM saved_locations WHERE id = ?`,
          [daySchedule.saved_location_id]
        ) as SavedLocation | undefined;

        if (location) {
          // Convert database fields to frontend format
          const locationWithCoordinates = {
            ...location,
            coordinates: {
              lat: location.lat,
              lng: location.lng
            }
          };
          
          if (!daysMap.has(daySchedule.day_number)) {
            daysMap.set(daySchedule.day_number, []);
          }
          daysMap.get(daySchedule.day_number)!.push(locationWithCoordinates);
        }
      }

      // Convert to array format - generate all days from start to end date
      const startDate = new Date(trip.start_date);
      const endDate = new Date(trip.end_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const days = [];
      for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + dayNumber - 1);
        
        // Get locations for this day if they exist
        const dayLocations = daysMap.get(dayNumber) || [];
        
        days.push({
          day: dayNumber,
          date: dayDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          locations: dayLocations
        });
      }

      return {
        ...trip,
        coverImage: trip.cover_image, // Convert snake_case to camelCase
        startDate: trip.start_date, // Convert snake_case to camelCase
        endDate: trip.end_date, // Convert snake_case to camelCase
        days
      };
    })
  );

  const response: ApiResponse<Trip[]> = {
    success: true,
    data: tripsWithDetails,
    message: 'Trips retrieved successfully'
  };

  res.json(response);
});

// Get single trip
export const getTrip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;

  const trip = await database.get(
    `SELECT * FROM trips WHERE id = ? AND user_id = ?`,
    [id, req.user.id]
  ) as Trip | undefined;

  if (!trip) {
    throw createError('Trip not found', 404);
  }

  // Get day schedules and locations
  const daySchedules = await database.all(
    `SELECT * FROM day_schedules WHERE trip_id = ? ORDER BY day_number, position`,
    [trip.id]
  ) as DaySchedule[];

  // Group by day number
  const daysMap = new Map<number, SavedLocation[]>();
  
  for (const daySchedule of daySchedules) {
    const location = await database.get(
      `SELECT * FROM saved_locations WHERE id = ?`,
      [daySchedule.saved_location_id]
    ) as SavedLocation | undefined;

    if (location) {
      // Convert database fields to frontend format
      const locationWithCoordinates = {
        ...location,
        coordinates: {
          lat: location.lat,
          lng: location.lng
        }
      };
      
      if (!daysMap.has(daySchedule.day_number)) {
        daysMap.set(daySchedule.day_number, []);
      }
      daysMap.get(daySchedule.day_number)!.push(locationWithCoordinates);
    }
  }

  // Convert to array format - generate all days from start to end date
  const startDate = new Date(trip.start_date);
  const endDate = new Date(trip.end_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const days = [];
  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayNumber - 1);
    
    // Get locations for this day if they exist
    const dayLocations = daysMap.get(dayNumber) || [];
    
    days.push({
      day: dayNumber,
      date: dayDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      locations: dayLocations
    });
  }

  const tripWithDetails = {
    ...trip,
    coverImage: trip.cover_image, // Convert snake_case to camelCase
    startDate: trip.start_date, // Convert snake_case to camelCase
    endDate: trip.end_date, // Convert snake_case to camelCase
    days
  };

  const response: ApiResponse<Trip> = {
    success: true,
    data: tripWithDetails,
    message: 'Trip retrieved successfully'
  };

  res.json(response);
});

// Create new trip
export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { name, startDate, endDate, coverImage }: CreateTripRequest = req.body;

  const tripId = database.generateId();
  const createdAt = database.getCurrentTimestamp();
  const updatedAt = createdAt;

  // Default cover image URL
  const defaultCoverImage = 'https://images.unsplash.com/photo-1707550936239-aa262b3ef116?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==&auto=format&fit=crop&q=80&w=2070';

  // Use provided coverImage or default to the default image
  const finalCoverImage = coverImage && coverImage.trim() !== '' ? coverImage : defaultCoverImage;

  // Create trip
  await database.run(
    `INSERT INTO trips (id, user_id, name, start_date, end_date, cover_image, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [tripId, req.user.id, name, startDate, endDate, finalCoverImage, createdAt, updatedAt]
  );

  // Get created trip with all details (including empty days)
  const tripWithDetails = await getTripById(tripId, req.user.id);

  const response: ApiResponse<Trip> = {
    success: true,
    data: tripWithDetails,
    message: 'Trip created successfully'
  };

  res.status(201).json(response);
});

// Update trip
export const updateTrip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;
  const updates: UpdateTripRequest = req.body;

  // Check if trip exists and belongs to user
  const existingTrip = await database.get(
    `SELECT * FROM trips WHERE id = ? AND user_id = ?`,
    [id, req.user.id]
  ) as Trip | undefined;

  if (!existingTrip) {
    throw createError('Trip not found', 404);
  }

  // Build update query
  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (updates.name !== undefined) {
    updateFields.push('name = ?');
    updateValues.push(updates.name);
  }
  if (updates.startDate !== undefined) {
    updateFields.push('start_date = ?');
    updateValues.push(updates.startDate);
  }
  if (updates.endDate !== undefined) {
    updateFields.push('end_date = ?');
    updateValues.push(updates.endDate);
  }
  if (updates.coverImage !== undefined) {
    // Default cover image URL
    const defaultCoverImage = 'https://images.unsplash.com/photo-1707550936239-aa262b3ef116?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==&auto=format&fit=crop&q=80&w=2070';
    
    // Use provided coverImage or default to the default image
    const finalCoverImage = updates.coverImage && updates.coverImage.trim() !== '' ? updates.coverImage : defaultCoverImage;
    
    updateFields.push('cover_image = ?');
    updateValues.push(finalCoverImage);
  }

  // If only days field is being updated, we don't need to update the trips table
  if (updateFields.length === 0 && updates.days !== undefined) {
    // Just return the current trip data
    const currentTrip = await database.get(
      `SELECT * FROM trips WHERE id = ?`,
      [id]
    ) as Trip;
    
    const response: ApiResponse<Trip> = {
      success: true,
      data: currentTrip,
      message: 'Trip updated successfully'
    };
    
    res.json(response);
    return;
  }
  
  if (updateFields.length === 0) {
    throw createError('No fields to update', 400);
  }

  updateFields.push('updated_at = ?');
  updateValues.push(database.getCurrentTimestamp());
  updateValues.push(id);

  await database.run(
    `UPDATE trips SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  // Get updated trip with all details
  const updatedTrip = await getTripById(id, req.user.id);

  const response: ApiResponse<Trip> = {
    success: true,
    data: updatedTrip,
    message: 'Trip updated successfully'
  };

  res.json(response);
});

// Add location to day
export const addLocationToDay = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id, dayNumber } = req.params;
  const locationData: CreateSavedLocationRequest = req.body;

  // Check if trip exists and belongs to user
  const trip = await database.get(
    `SELECT * FROM trips WHERE id = ? AND user_id = ?`,
    [id, req.user.id]
  ) as Trip | undefined;

  if (!trip) {
    throw createError('Trip not found', 404);
  }

  // Check if location already exists for this trip
  const existingLocation = await database.get(
    `SELECT id FROM saved_locations WHERE trip_id = ? AND place_id = ?`,
    [id, locationData.placeId]
  ) as { id: string } | undefined;

  let savedLocationId: string;
  
  if (existingLocation) {
    // Use existing location
    savedLocationId = existingLocation.id;
    
    // Check if location is already in this day
    const existingDaySchedule = await database.get(
      `SELECT id FROM day_schedules WHERE trip_id = ? AND day_number = ? AND saved_location_id = ?`,
      [id, dayNumber, savedLocationId]
    );
    
    if (existingDaySchedule) {
      throw createError('Location already added to this day', 409);
    }
  } else {
    // Create new saved location
    savedLocationId = database.generateId();
    const createdAt = database.getCurrentTimestamp();

    await database.run(
      `INSERT INTO saved_locations (id, user_id, trip_id, name, address, place_id, lat, lng, type, opening_hours, photo_url, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        savedLocationId,
        req.user.id,
        id,
        locationData.name,
        locationData.address,
        locationData.placeId,
        locationData.coordinates.lat,
        locationData.coordinates.lng,
        locationData.type,
        locationData.openingHours || null,
        locationData.photoUrl || null,
        createdAt
      ]
    );
  }

  // Get next position for this day
  const lastPosition = await database.get(
    `SELECT position FROM day_schedules WHERE trip_id = ? AND day_number = ? ORDER BY position DESC LIMIT 1`,
    [id, dayNumber]
  ) as { position: number } | undefined;

  const nextPosition = lastPosition ? lastPosition.position + 1 : 1;

  // Create day schedule entry
  const dayScheduleId = database.generateId();
  await database.run(
    `INSERT INTO day_schedules (id, trip_id, day_number, position, saved_location_id) VALUES (?, ?, ?, ?, ?)`,
    [dayScheduleId, id, dayNumber, nextPosition, savedLocationId]
  );

  // Get updated trip with all details
  const updatedTrip = await getTripById(id, req.user.id);

  const response: ApiResponse<Trip> = {
    success: true,
    data: updatedTrip,
    message: 'Location added successfully'
  };

  res.status(201).json(response);
});

// Remove location from day
export const removeLocationFromDay = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id, dayNumber, locationId } = req.params;

  // Check if trip exists and belongs to user
  const trip = await database.get(
    `SELECT * FROM trips WHERE id = ? AND user_id = ?`,
    [id, req.user.id]
  ) as Trip | undefined;

  if (!trip) {
    throw createError('Trip not found', 404);
  }

  // Find the day schedule entry
  const daySchedule = await database.get(
    `SELECT * FROM day_schedules WHERE trip_id = ? AND day_number = ? AND saved_location_id = ?`,
    [id, dayNumber, locationId]
  ) as DaySchedule | undefined;

  if (!daySchedule) {
    throw createError('Location not found in this day', 404);
  }

  // Delete day schedule entry
  await database.run(
    `DELETE FROM day_schedules WHERE id = ?`,
    [daySchedule.id]
  );

  // Delete saved location
  await database.run(
    `DELETE FROM saved_locations WHERE id = ?`,
    [locationId]
  );

  // Get updated trip with all details
  const updatedTrip = await getTripById(id, req.user.id);

  const response: ApiResponse<Trip> = {
    success: true,
    data: updatedTrip,
    message: 'Location removed successfully'
  };

  res.json(response);
});

// Reorder locations in day
export const reorderLocationsInDay = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id, dayNumber } = req.params;
  const { locationIds } = req.body;

  // Check if trip exists and belongs to user
  const trip = await database.get(
    `SELECT * FROM trips WHERE id = ? AND user_id = ?`,
    [id, req.user.id]
  ) as Trip | undefined;

  if (!trip) {
    throw createError('Trip not found', 404);
  }

  // Update positions
  for (let i = 0; i < locationIds.length; i++) {
    await database.run(
      `UPDATE day_schedules SET position = ? WHERE trip_id = ? AND day_number = ? AND saved_location_id = ?`,
      [i + 1, id, dayNumber, locationIds[i]]
    );
  }

  // Get updated trip with all details
  const updatedTrip = await getTripById(id, req.user.id);

  const response: ApiResponse<Trip> = {
    success: true,
    data: updatedTrip,
    message: 'Locations reordered successfully'
  };

  res.json(response);
});

// Soft delete trip
export const deleteTrip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;

  // Check if trip exists and belongs to user
  const existingTrip = await database.get(
    `SELECT * FROM trips WHERE id = ? AND user_id = ? AND deleted = 0`,
    [id, req.user.id]
  ) as Trip | undefined;

  if (!existingTrip) {
    throw createError('Trip not found', 404);
  }

  // Soft delete by setting deleted = 1
  await database.run(
    `UPDATE trips SET deleted = 1, updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), id]
  );

  const response: ApiResponse<null> = {
    success: true,
    data: null,
    message: 'Trip deleted successfully'
  };

  res.json(response);
});