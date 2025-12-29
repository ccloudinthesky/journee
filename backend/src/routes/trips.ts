import { Router } from 'express';
import {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  addLocationToDay,
  removeLocationFromDay,
  reorderLocationsInDay
} from '../controllers/tripController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCreateTrip,
  validateUpdateTrip,
  validateCreateLocation,
  validateRequest,
  validateDateRange
} from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Trip CRUD routes
router.get('/', getTrips);
router.get('/:id', getTrip);
router.post('/', validateCreateTrip, validateDateRange, validateRequest, createTrip);
router.put('/:id', validateUpdateTrip, validateDateRange, validateRequest, updateTrip);
router.delete('/:id', deleteTrip);

// Location management routes
router.post('/:id/days/:dayNumber/locations', validateCreateLocation, validateRequest, addLocationToDay);
router.delete('/:id/days/:dayNumber/locations/:locationId', removeLocationFromDay);
router.put('/:id/days/:dayNumber/locations/reorder', reorderLocationsInDay);

export default router;
