import { SECRET } from "../utils.js";
import jwt from "jsonwebtoken";
import { UserDTO } from "../dto/userDTO.js";
import { config } from "../config/config.js";
import nodemailer from "nodemailer";
import { userService } from "../services/UserService.js";

export class SessionsController {
  static redirectToMain = (req, res) => {
    res.redirect(`${config.ROOT_URL}`);
  };

  static register = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    return res.status(201).json({ message: "Register OK", newUser: req.user });
  };

  static login = async (req, res) => {
    let { email, password, loginStrategy } = req.body;
    if (!email || !password) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ payload: "Enter email and password" });
    }
    try {
      let user = await userService.getUsersBy({ email });
      if (!user)
        return res
          .status(400)
          .send(`Wrong credentials...There is no user with that mail...!!!`);
      user = new UserDTO(user);
      user = { ...user };
      let token = jwt.sign(user, SECRET, { expiresIn: "1h" });
      res.cookie("codercookie", token, { httpOnly: true });
      await userService.updateUser(
        { email },
        { loginStrategy },
        { last_connection: new Date() }
      );
      return res.status(200).json({
        userLogged: user,
        token,
      });
    } catch (error) {
      let errorData = {
        title: "Error logging in",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
  };

  static logout = async (req, res) => {
    try {
      if (!req.user) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `User is not logged...!!!` });
      }
      if (req.user.loginStrategy === "jwt") {
        const token = req.cookies.codercookie;
        if (!token) {
          res.setHeader("Content-Type", "application/json");
          return res.status(400).json({ error: `User is not logged...!!!` });
        }
        const user = jwt.verify(token, SECRET);
        const email = user.email;
        await userService.updateUser(
          { email },
          { last_connection: new Date() }
        );
        res.clearCookie("codercookie");
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ payload: `Bye ${user.name}, hope to see you back soon!` });
      }
      if (req.user.loginStrategy === "gitHub") {
        const userName = req.user.name;
        req.logout((err) => {
          if (err) {
            return res.status(500).send("Error closing session");
          }
          req.session.destroy((err) => {
            if (err) {
              return res.status(500).send("Error destroying session");
            }
            res.clearCookie("connect.sid");
            res.setHeader("Content-Type", "application/json");
            return res
              .status(200)
              .json({ payload: `Bye ${userName}, hope to see you back soon!` });
          });
        });
      }
    } catch (error) {
      let errorData = {
        title: "Error logging out",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected error logging out- Try later or contact administrator...!!!`,
      });
    }
  };

  static passwordReset = async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).send("Enter email");
    try {
      let user = await userService.getUsersBy({ email });
      if (!user) return res.status(400).send(`Mail not registered...!!!`);
      let tokenpwr = jwt.sign(user, SECRET, { expiresIn: 3600 });
      res.cookie("resetPasswordcookie", tokenpwr, { httpOnly: true });
      const userjwt = jwt.verify(tokenpwr, SECRET, { algorithms: ["HS256"] });
      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: "587",
        auth: {
          user: "javier.rojo66@gmail.com",
          pass: config.GMAIL_PASS,
        },
      });
      transporter.sendMail({
        from: "rojozon javier.rojo66@gmail.com",
        to: user.email,
        subject: "Reset your password",
        html: `<a href="${config.ROOT_URL}/passwordResetForm/?token=${tokenpwr}">Reset your password</a>`,
      });
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({
        payload: `An email was sent to ${user.email}. Check your spambox if not received. Follow instructions`,
      });
    } catch (error) {
      let errorData = {
        title: "Error reseting password",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected error - Try later or contact administrator...!!!`,
      });
    }
  };

  static error = (req, res) => {
    res.setHeader("Content-Type", "application/json");
    let errorData = {
      title: "Authentification error",
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    customLogger.error(JSON.stringify(errorData, null, 5));
    return res.status(500).json({
      error: `Unexpected server error - Try again later or contact admninistrator`,
      detail: `Authentication error...!!!`,
    });
  };

  static loginGitHub = (req, res) => {
    async (req, res) => {
      delete user.password;
      req.session.user = user;
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ payload: "Successful Login...!!!", user });
    };
  };

  static callBackGitHub = async (req, res) => {
    const email = req.user.email;
    req.user.loginStrategy = "gitHub";
    try{
    const u = await userService.updateUser(
      { email },
      { loginStrategy: "gitHub" }
    );
    req.session.user = req.user;
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ payload: req.user });
  } catch(error){
      let errorData = {
        title: "gitHub authentification error",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
        detail: `Authentication error...!!!`,
      });
  };
  }; 

  static current = (req, res) => {
    let userSessions = req.session.user;
    userSessions = new UserDTO(userSessions);
    if (!userSessions) {
      userSessions = "No sessions users logged";
    }
    let token = req.cookies["codercookie"];
    try {
      let userJWT = jwt.verify(token, SECRET);
      userJWT = new UserDTO(userJWT);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ userSessions, userJWT });
    } catch (error) {
        let errorData = {
        title: "Logged users error",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(401).json({ userJWT: `${error}`, userSessions });
    }
  };

  static premium = async (req, res) => {
    try {
      let uid = req.params.uid;
      let user = await userService.getUsersBy({ _id: uid });
      if (user.role === "premium") {
        await userService.updateUser({ _id: uid }, { role: "user" });
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ payload: `User ${user.email} is now user` });
      }
      if (
        user.role === "user" &&
        user.documents[0].reference !== "" &&
        user.documents[1].reference !== "" &&
        user.documents[2].reference !== ""
      ) {
        await userService.updateUser({ _id: uid }, { role: "premium" });
        res.setHeader("Content-Type", "application/json");
        return res
          .status(200)
          .json({ payload: `User ${user.email} is now premium` });
      } else {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({
          error: `Role is not premium nor user or missing or incomplete documents...!!!`,
        });
      }
    } catch (error) {
      let errorData = {
        title: "error toggling roles",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - contact your administrator`,
      });
    }
  };

  static addDocument = async (req, res) => {
    let userId;
    if (!req.fileDoc) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Choose file and try again...!!!` });
    }
    if ((req.params.uid = "web")) {
      userId = req.user._id;
    } else {
      userId = req.params.uid;
    }
    const reference = req.fileSavedPath + "/" + req.fileSavedName;
    try {
    
      const user = await userService.getUsersBy({ _id: userId });
      let documents = user.documents;
      switch (req.fileDoc) {
        case "profile":
          break;
        case "product":
          break;
        case "identification":
          documents[0].reference = reference;
          break;
        case "addressProof":
          documents[1].reference = reference;
          break;
        case "bankStatement":
          documents[2].reference = reference;

          break;
        default:
      }
      await userService.updateUser({ _id: userId }, { documents });
    } catch (error) {
      let errorData = {
        title: "error attaching documents",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - contact your administrator`,
      });
    }
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ payload: "File saved...!!!" });
  };
}
