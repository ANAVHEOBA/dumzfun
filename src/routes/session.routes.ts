// routes/session.routes.ts
import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateSchema } from '../middleware/validation.middleware';
import { sessionSchemas } from '../schemas/sessions.schema';

const router = Router();

router.get(
  '/',
  authMiddleware,
  SessionController.getActiveSessions
);

router.delete(
  '/:sessionId',
  authMiddleware,
  validateSchema(sessionSchemas.invalidate),
  SessionController.invalidateSession
);

router.delete(
  '/',
  authMiddleware,
  SessionController.invalidateAllSessions
);

export default router;