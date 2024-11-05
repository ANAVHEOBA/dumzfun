// routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import sessionRoutes from './session.routes';
import adminRoutes from './admin.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/sessions', sessionRoutes);
router.use('/admin', adminRoutes);
router.use('/health', healthRoutes);

export default router;