// routes/activities.router.js
import express from "express";
import { activitiesController } from "../controller/ActivitiesController.js";

const router = express.Router();

router.post("/", activitiesController.createActivity.bind(activitiesController));

export default router;
