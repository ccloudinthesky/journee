import { Router } from 'express';
import {
  getSavedLocations,
  getSavedLocation,
  createSavedLocation,
  updateSavedLocation,
  deleteSavedLocation,
  bulkDeleteSavedLocations
} from '../controllers/savedLocationController';
import { authenticateToken } from '../middleware/auth';
import {
  validateCreateSavedLocation,
  validateRequest
} from '../utils/validators';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Saved location CRUD routes
router.get('/', getSavedLocations);
router.get('/:id', getSavedLocation);
router.post('/', validateCreateSavedLocation, validateRequest, createSavedLocation);
router.put('/:id', validateCreateSavedLocation, validateRequest, updateSavedLocation);
router.delete('/:id', deleteSavedLocation);
router.delete('/', bulkDeleteSavedLocations);

export default router;
