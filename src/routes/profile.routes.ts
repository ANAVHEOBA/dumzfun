// routes/profile.routes.ts
import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateSchema } from '../middleware/validation.middleware';
import { profileSchemas } from '../schemas/profile.schema';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';

const router = Router();

const profileRateLimit = rateLimitMiddleware({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30 // 30 requests per hour
});

router.post(
  '/',
  authMiddleware,
  validateSchema(profileSchemas.create),
  ProfileController.createProfile
);

router.put(
  '/',
  authMiddleware,
  validateSchema(profileSchemas.update),
  ProfileController.updateProfile
);

router.get(
  '/:walletAddress',
  profileRateLimit,
  ProfileController.getProfile
);

router.delete(
  '/',
  authMiddleware,
  ProfileController.deleteProfile
);

router.get(
  '/me',
  authMiddleware,
  ProfileController.getOwnProfile
);

export default router;