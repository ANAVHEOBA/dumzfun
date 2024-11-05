// routes/admin.routes.ts
import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/role.middleware';
import { validateSchema } from '../middleware/validation.middleware';
import { adminSchemas } from '../schemas/admin.schema';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminOnly);

router.get(
  '/users',
  AdminController.getUsers
);

router.put(
  '/users/:walletAddress/roles',
  validateSchema(adminSchemas.updateRoles),
  AdminController.updateUserRoles
);

router.get(
  '/stats',
  AdminController.getSystemStats
);

router.delete(
  '/users/:walletAddress/sessions',
  AdminController.invalidateUserSessions
);

router.get(
  '/logs',
  AdminController.getSystemLogs
);

export default router;