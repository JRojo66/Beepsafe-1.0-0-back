import rateLimit from "express-rate-limit";
import dotenv from 'dotenv';

dotenv.config();

const maxAttempts = parseInt(process.env.LOGIN_MAX_ATTEMPTS) || 10;
const blockMinutes = parseInt(process.env.LOGIN_BLOCK_TIME_MINUTES) || 60;

// Configurar el limitador para el login
export const loginLimiter = rateLimit({
  windowMs: blockMinutes * 60 * 1000,
  max: maxAttempts,
  handler: (req, res) => {
    // Enviar al usuario a la página de login con un mensaje de error
    res
      .status(429)
      .json({
        error:
          "Has excedido el número máximo de intentos de inicio de sesión.",
          retryAfter: Math.ceil((req.rateLimit.resetTime - new Date()) / (1000 * 60)) // Minutos faltantes
      });
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip;
  },
});
