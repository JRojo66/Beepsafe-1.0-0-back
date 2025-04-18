import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const authJWT = (req, res, next) => {
  const token = req.cookies?.codercookie || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
