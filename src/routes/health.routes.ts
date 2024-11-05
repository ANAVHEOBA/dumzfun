// routes/health.routes.ts
import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

router.get(
  '/',
  HealthController.checkHealth
);

router.get(
  '/detailed',
  HealthController.checkDetailedHealth
);

export default router;