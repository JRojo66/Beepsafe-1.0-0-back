import { Router } from "express";
import dotenv from 'dotenv';

dotenv.config();

export const configRouter = Router();

configRouter.get("/", (req, res) => {
  res.json({
    maxLoginAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS) || 3,
    blockTimeMinutes: parseInt(process.env.LOGIN_BLOCK_TIME_MINUTES) || 60
    //rootURL: parseInt
  });
});
