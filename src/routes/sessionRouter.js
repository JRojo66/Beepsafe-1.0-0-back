import { Router } from "express";
import passport from "passport";
import { SessionsController } from "../controller/SessionsController.js";

export const router = Router();

router.get("/", SessionsController.redirectToMain);
router.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/api/sessions/error" }),
  SessionsController.register
);
router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/api/sessions/error" }),
  SessionsController.login
);
router.post("/passwordReset", SessionsController.passwordReset);
router.get("/error", SessionsController.error);
router.get(
  "/login/github",
  passport.authenticate("github", {}),
  SessionsController.loginGitHub
);
router.get(
  "/callBackGithub",
  passport.authenticate("github", { failureRedirect: "/api/sessions/error" }),
  SessionsController.callBackGitHub
);
router.get("/logout", SessionsController.logout);
router.get("/current", SessionsController.current);
