// middleware/authJWT.js
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export function authJWT(req, res, next) {
  const token = req.cookies.beepcookie;

  if (!token) {
    return res.status(401).json({ message: "Token no encontrado en cookie." });
  }

  try {
    const decoded = jwt.verify(token, config.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido." });
  }
}
