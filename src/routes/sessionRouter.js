  import { Router } from "express";
  import passport from "passport";
  import { SessionsController } from "../controller/SessionsController.js";
  import { authJWT } from '../middleware/authJWT.js';

  export const router = Router();

  router.get("/", SessionsController.redirectToMain);
  router.post(
    "/register",
    (req, res, next) => { // Middleware personalizado para manejar la respuesta de Passport
      passport.authenticate("register", (err, user, info) => {
        if (err) {
          return next(err); // Pasar el error al middleware de manejo de errores
        }
        if (!user) {
          // 'info' puede contener un mensaje si la estrategia lo proporciona
          return res.status(409).json({ error: info?.message || "Error al registrar la cuenta." }); // Código 409 para conflicto
        }
        // Si el usuario se registró correctamente, puedes iniciar sesión aquí o enviar una respuesta de éxito
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.status(201).json({ message: "Usuario registrado exitosamente", user: user });
        });
      })(req, res, next);
    },
    // SessionsController.register // Ya no es el handler directo
  );
  router.post('/login', SessionsController.login);
  router.post("/passwordReset", SessionsController.passwordReset);
  router.get("/error", SessionsController.error);
  // router.get(
  //   "/login/github",
  //   passport.authenticate("github", {}),
  //   SessionsController.loginGitHub
  // );
  // router.get(
  //   "/callBackGithub",
  //   passport.authenticate("github", { failureRedirect: "/api/sessions/error" }),
  //   SessionsController.callBackGitHub
  // );
  router.get("/logout", SessionsController.logout);
  router.get("/current", SessionsController.current);
