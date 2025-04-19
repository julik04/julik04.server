import { Router } from "express";
import loginController from "../controllers/loginController.js";

const router = Router();

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Perform login operation
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.get("/", loginController.login);

export default router;
