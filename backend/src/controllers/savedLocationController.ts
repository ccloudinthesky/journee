import { Request, Response } from 'express';
import { database } from '../config/database';
import { ApiResponse, SavedLocation, CreateSavedLocationRequest } from '../types';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Get all saved locations for current user
export const getSavedLocations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { search, type, trip_id, page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let query = 'SELECT * FROM saved_locations WHERE user_id = ?';
  const queryParams: any[] = [req.user.id];

  // Add trip_id filter
  if (trip_id && typeof trip_id === 'string') {
    query += ' AND trip_id = ?';
    queryParams.push(trip_id);
  }

  // Add search filter
  if (search && typeof search === 'string') {
    query += ' AND (name LIKE ? OR address LIKE ?)';
    const searchTerm = `%${search}%`;
    queryParams.push(searchTerm, searchTerm);
  }

  // Add type filter
  if (type && typeof type === 'string') {
    query += ' AND type = ?';
    queryParams.push(type);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(Number(limit), offset);

  const savedLocations = await database.all(query, queryParams) as SavedLocation[];

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM saved_locations WHERE user_id = ?';
  const countParams: any[] = [req.user.id];

  if (trip_id && typeof trip_id === 'string') {
    countQuery += ' AND trip_id = ?';
    countParams.push(trip_id);
  }

  if (search && typeof search === 'string') {
    countQuery += ' AND (name LIKE ? OR address LIKE ?)';
    const searchTerm = `%${search}%`;
    countParams.push(searchTerm, searchTerm);
  }

  if (type && typeof type === 'string') {
    countQuery += ' AND type = ?';
    countParams.push(type);
  }

  const countResult = await database.get(countQuery, countParams) as { total: number };
  const total = countResult.total;

  const response: ApiResponse<{
    locations: SavedLocation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> = {
    success: true,
    data: {
      locations: savedLocations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    },
    message: 'Saved locations retrieved successfully'
  };

  res.json(response);
});

// Get single saved location
export const getSavedLocation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;

  const savedLocation = await database.get(
    'SELECT * FROM saved_locations WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  ) as SavedLocation | undefined;

  if (!savedLocation) {
    throw createError('Saved location not found', 404);
  }

  const response: ApiResponse<SavedLocation> = {
    success: true,
    data: savedLocation,
    message: 'Saved location retrieved successfully'
  };

  res.json(response);
});

// Create new saved location
export const createSavedLocation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const locationData: CreateSavedLocationRequest = req.body;

  // Check if location already exists for this user
  const existingLocation = await database.get(
    'SELECT id FROM saved_locations WHERE user_id = ? AND place_id = ?',
    [req.user.id, locationData.placeId]
  );

  if (existingLocation) {
    throw createError('Location already saved', 409);
  }

  const savedLocationId = database.generateId();
  const createdAt = database.getCurrentTimestamp();

  await database.run(
    `INSERT INTO saved_locations (id, user_id, trip_id, name, address, place_id, lat, lng, type, opening_hours, photo_url, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      savedLocationId,
      req.user.id,
      locationData.tripId,
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

  // Get created saved location
  const savedLocation = await database.get(
    'SELECT * FROM saved_locations WHERE id = ?',
    [savedLocationId]
  ) as SavedLocation;

  const response: ApiResponse<SavedLocation> = {
    success: true,
    data: savedLocation,
    message: 'Location saved successfully'
  };

  res.status(201).json(response);
});

// Update saved location
export const updateSavedLocation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;
  const updates: Partial<CreateSavedLocationRequest> = req.body;

  // Check if saved location exists and belongs to user
  const existingLocation = await database.get(
    'SELECT * FROM saved_locations WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  ) as SavedLocation | undefined;

  if (!existingLocation) {
    throw createError('Saved location not found', 404);
  }

  // Build update query
  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (updates.name !== undefined) {
    updateFields.push('name = ?');
    updateValues.push(updates.name);
  }
  if (updates.address !== undefined) {
    updateFields.push('address = ?');
    updateValues.push(updates.address);
  }
  if (updates.coordinates !== undefined) {
    updateFields.push('lat = ?', 'lng = ?');
    updateValues.push(updates.coordinates.lat, updates.coordinates.lng);
  }
  if (updates.type !== undefined) {
    updateFields.push('type = ?');
    updateValues.push(updates.type);
  }
  if (updates.openingHours !== undefined) {
    updateFields.push('opening_hours = ?');
    updateValues.push(updates.openingHours);
  }
  if (updates.photoUrl !== undefined) {
    updateFields.push('photo_url = ?');
    updateValues.push(updates.photoUrl);
  }

  if (updateFields.length === 0) {
    throw createError('No fields to update', 400);
  }

  updateValues.push(id);

  await database.run(
    `UPDATE saved_locations SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  // Get updated saved location
  const updatedLocation = await database.get(
    'SELECT * FROM saved_locations WHERE id = ?',
    [id]
  ) as SavedLocation;

  const response: ApiResponse<SavedLocation> = {
    success: true,
    data: updatedLocation,
    message: 'Saved location updated successfully'
  };

  res.json(response);
});

// Delete saved location
export const deleteSavedLocation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { id } = req.params;

  // Check if saved location exists and belongs to user
  const savedLocation = await database.get(
    'SELECT * FROM saved_locations WHERE id = ? AND user_id = ?',
    [id, req.user.id]
  ) as SavedLocation | undefined;

  if (!savedLocation) {
    throw createError('Saved location not found', 404);
  }

  await database.run(
    'DELETE FROM saved_locations WHERE id = ?',
    [id]
  );

  const response: ApiResponse<null> = {
    success: true,
    message: 'Saved location deleted successfully'
  };

  res.json(response);
});

// Bulk delete saved locations
export const bulkDeleteSavedLocations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError('Invalid IDs array', 400);
  }

  // Delete multiple saved locations
  const placeholders = ids.map(() => '?').join(',');
  const result = await database.run(
    `DELETE FROM saved_locations WHERE id IN (${placeholders}) AND user_id = ?`,
    [...ids, req.user.id]
  );

  const response: ApiResponse<null> = {
    success: true,
    message: `${(result as any).changes} saved locations deleted successfully`
  };

  res.json(response);
});
