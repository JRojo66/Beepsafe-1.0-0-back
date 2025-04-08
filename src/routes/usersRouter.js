import { Router } from "express";
import { SessionsController } from "../controller/SessionsController.js";
import { upload } from "../utils.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

export const router = Router();

router.get("/premium/:uid",roleMiddleware(["admin"]),SessionsController.premium);
router.post(
  "/:uid/documents",
  roleMiddleware(["admin", "user", "premium"]),
  upload.single("document"),
  SessionsController.addDocument
);
router.post(
  "/:uid/documents/profile",
  roleMiddleware(["admin", "user", "premium"]),
  upload.single("profile"),
  SessionsController.addDocument
);
router.post(
  "/:uid/documents/product",
  roleMiddleware(["admin", "user", "premium"]),
  upload.single("product"),
  SessionsController.addDocument
);
router.post(
  "/:uid/documents/identification",
  roleMiddleware(["admin", "user", "premium"]),
  upload.single("identification"),
  SessionsController.addDocument
);
router.post(
  "/:uid/documents/addressProof",
  roleMiddleware(["admin", "user", "premium"]),
  upload.single("addressProof"),
  SessionsController.addDocument
);
router.post(
  "/:uid/documents/bankStatement",
  roleMiddleware(["admin", "user", "premium"]),
  upload.single("bankStatement"),
  SessionsController.addDocument
);
