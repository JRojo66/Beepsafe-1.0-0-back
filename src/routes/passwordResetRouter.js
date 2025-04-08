import { Router } from "express";
import { PasswordResetController } from "../controller/PasswordResetController.js";

export const router = Router();

router.post("/", PasswordResetController.pwr);
