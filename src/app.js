import express from "express";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import sessions from "express-session";
import MongoStore from "connect-mongo";
import { Server } from "socket.io";
import { __dirname, middLogger, customLogger } from "./utils.js";
import { join } from "path";
import { router as productsRouter } from "./routes/productsRouter.js";
import { router as cartRouter } from "./routes/cartRouter.js";
import { router as viewsRouter } from "./routes/views.Router.js";
import { router as sessionRouter } from "./routes/sessionRouter.js";
import {router as passwordResetRouter} from "./routes/passwordResetRouter.js";
import {router as usersRouter} from "./routes/usersRouter.js";
import passport from "passport";  
import { initPassport } from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import { config } from "./config/config.js";
import { chatService } from "./services/chatService.js";
import { errorHandler } from "./middleware/Errorhandler.js";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import cors from 'cors';

const PORT = config.PORT;

const app = express();
let io;

// Configuración de CORS
app.use(cors({
  origin: function (origin, callback) {
      if (!origin || origin.startsWith('http://127.0.0.1')) {
          callback(null, origin);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));



// Documentation - Swagger
// Define object with parameters for swagger
const options={
  definition:{
      openapi: "3.0.0",
      info:{
          title:"Rojozon Backend",
          version: "1.0.0",
          description:"Rojozon e-commerce website documentation"
      },
  },
  apis: ["./src/docs/*.yaml"]
}

const spec = swaggerJsDoc(options);
app.use("/api-docs",swaggerUI.serve, swaggerUI.setup(spec));
// end swagger


app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // allow to receive complex data from url//
app.use(cookieParser());

app.engine("handlebars", engine()); // Configures handlebars
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use(middLogger);

app.use(
  // Configures sessions
  sessions({
    secret: "config.SECRET",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      ttl: 3600,
      mongoUrl: config.MONGO_URL,
    }),
  })
);

initPassport(); // Configures passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/", viewsRouter);
app.use(
  "/api/products",
  (req, res, next) => {
    req.serverSocket = io;
    next();
  },
  productsRouter
);
app.use("/api/cart", cartRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/passwordReset",passwordResetRouter);
app.use("/api/users",usersRouter)


app.use(errorHandler);

const server = app.listen(PORT, () => {
  customLogger.debug(`Server on line at port ${PORT}`);
});

// Chat
let chatUsers = [];
let messages = [];

io = new Server(server);

io.on("connection", (socket) => {
  console.log(`Client id ${socket.id} connected...!!!`);
  socket.on("id", (chatName) => {
    chatUsers.push({ id: socket.id, chatName });
    socket.emit("previousMessages", messages);
    socket.broadcast.emit("New User", chatName);
  });
  socket.on("message", (chatName, message) => {
    messages.push({ chatName, message });
    chatService.addMessage(chatName, message);
    io.emit("newMessage", chatName, message);
  });
  socket.on("disconnect", () => {
    let chatUser = chatUsers.find((u) => u.id === socket.id);
    if (chatUser) {
      io.emit("userLogout", chatUser.chatName);
    }
  });
});

// Connection to mongoDb
const connDB = async () => {
  // Connects to mongoDb
  try {
    await mongoose.connect(config.MONGO_URL, {
      dbName: config.DB_NAME,
    });
    customLogger.debug("DB Online...!!!");
  } catch (error) {
    let errorData = {
      title: "Error connecting to DB ",
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    customLogger.error(JSON.stringify(errorData, null, 5));
  }
};
connDB();


