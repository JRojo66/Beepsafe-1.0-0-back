// routes/activities.router.js
import express from "express";
import { activitiesController } from "../controller/ActivitiesController.js";
import { authJWT } from "../middleware/authJWT.js";

const router = express.Router();

router.post("/", authJWT, activitiesController.createActivity.bind(activitiesController));
router.get("/:email", activitiesController.getActivitiesByEmail.bind(activitiesController));
router.get("/", activitiesController.getAllActivities.bind(activitiesController));
// router.delete("/", authJWT, activitiesController.deleteActivity.bind(activitiesController));


export default router;
