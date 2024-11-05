// routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateSchema } from '../middleware/validation.middleware';
import { authSchemas } from '../schemas/auth.schemas';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';

const router = Router();

// Rate limit configuration for auth routes
const authRateLimit = rateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per window
});

/**
 * @swagger
 * /auth/connect:
 *   post:
 *     summary: Connect wallet
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *     responses:
 *       200:
 *         description: Nonce generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     nonce:
 *                       type: string
 *                       example: "abc123"
 *                     walletAddress:
 *                       type: string
 *                       example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *                     message:
 *                       type: string
 *                       example: "Verify wallet ownership with nonce: abc123"
 */
router.post(
  '/connect',
  validateSchema(authSchemas.connect),
  authRateLimit,
  AuthController.connectWallet
);

/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify wallet signature
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *               signature:
 *                 type: string
 *                 example: "0xabc123..."
 *     responses:
 *       200:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "jwt_token_here"
 */
router.post(
  '/verify',
  validateSchema(authSchemas.verify),
  authRateLimit,
  AuthController.verifySignature
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "refresh_token_here"
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: "new_jwt_token_here"
 */
router.post(
  '/refresh',
  validateSchema(authSchemas.refresh),
  AuthController.refreshToken
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 */
router.post(
  '/logout',
  authMiddleware,
  AuthController.logout
);

export default router;
