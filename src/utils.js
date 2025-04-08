import { fileURLToPath } from "url";
import { dirname, join } from "path";
import bcrypt from "bcrypt";
import winston from "winston";
import { config } from "./config/config.js";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const SECRET = config.SECRET;

export const generateHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (password, passwordHash) =>
  bcrypt.compareSync(password, passwordHash);

let customLevels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
};

const customLoggerConsole = winston.createLogger({
  levels: customLevels,
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(winston.format.simple()),
    }),
  ],
});

export const customLogger = winston.createLogger({
  levels: customLevels,
  transports: [
    new winston.transports.File({
      level: "info",
      filename: "./src/errors.log",
      format: winston.format.combine(winston.format.timestamp()),
    }),
  ],
});

if (config.RUN_MODE === "DEV") {
  customLogger.add(customLoggerConsole);
}

export const middLogger = (res, req, next) => {
  req.logger = customLogger;
  next();
};

// Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    req.fileDoc = file.fieldname;
    if (file.fieldname === "profile") {
      cb(null, "./src/profiles");
      req.fileSavedPath = "./src/profiles";
      req.fileSavedDoc = "profile";
    } else {
      if (file.fieldname === "product") {
        cb(null, "./src/products");
        req.fileSavedPath = "./src/products";
        req.fileSavedDoc = "product";
      } else {
        if (
          file.fieldname === "identification" ||
          file.fieldname === "addressProof" ||
          file.fieldname === "bankStatement"
        ) {
          cb(null, "./src/documents");
          req.fileSavedPath = "./src/documents";
          req.fileSavedDoc = "";
        } else {
          cb(null, "./src/uploads");
          req.fileSavedPath = "./src/uploads";
        }
      }
    }
  },
  filename: function (req, file, cb) {
    let type = file.mimetype.split("/")[0];
    if (type !== "image" && type !== "application") {
      return cb(new Error("Only images or documents admitted...!"));
    }
    const fileSavedName = Date.now() + "-" + file.originalname;
    cb(null, fileSavedName);
    req.fileSavedName = fileSavedName;
  },
});

export const upload = multer({ storage });
