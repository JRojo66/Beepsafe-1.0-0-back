import { ERROR_TYPE } from "../utils/EErrors.js";
import { customLogger } from "../utils.js";

export const errorHandler = (error, req, res, next) => {
  customLogger.error(`${error.cause ? error.cause : error.message}`);
  switch (error.code) {
    case ERROR_TYPE.AUTENTICATION || ERROR_TYPE.AUTHORIZATION:
      res.setHeader("Content-Type", "application/json");
      return res.status(401).json({ error: `${"Wrong credentials...!!!"}` });
    case ERROR_TYPE.INVALID_ARGUMENTS:
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `${error.message}` });

    default:
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: `Error: Contact admnistrator...` });
      break;
  }
};
