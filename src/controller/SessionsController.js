import { SECRET, generateHash, isValidPassword } from "../utils.js";
import jwt from "jsonwebtoken";
import { UserDTO } from "../dto/userDTO.js";
import { config } from "../config/config.js";
import nodemailer from "nodemailer";
import { userService } from "../services/UserService.js";

export class SessionsController {
  static redirectToMain = (req, res) => {
    res.redirect(`${config.ROOT_URL}`);
  };

  // static register = async (req, res) => {
  //   res.setHeader("Content-Type", "application/json");
  //   return res.status(201).json({ message: "Registro OK", newUser: req.user });
  // };

  static register = async (req, res) => {
    let { name, email, phone, password, password2 } = req.body;
    if (!name.trim()) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ payload: "Ingrese nombre" });
    }
    if (!email.trim()) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ payload: "Ingrese email" });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ payload: "Ingrese un email válido" });
      }
    }
    if (!phone.trim()) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ payload: "Ingrese telefono" });
    } else {
      const phoneRegexStrictNoSeparators = /^([1-9]\d{1,3})\d{6,8}$/;
      if (!phoneRegexStrictNoSeparators.test(phone)) {
        return res.status(400).json({ payload: "Ingrese un telefono válido" });
      }
    }
    if (!password.trim()) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ payload: "Ingrese contraseña" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ payload: "La contraseña debe tener al menos 6 caracteres" });
    }
    if (password !== password2) {
      return res.status(400).json({ payload: "Las contraseñas no coinciden" });
    }
    try{
      let existsEmail = await userService.getUsersBy({ email: email });
      let existsName = await userService.getUsersBy({ name: name });
      if (existsEmail) {
        return res.status(500).json({ payload: "Ya existe un usuario registrado con ese mail" });
      }
      if (existsName) {
        return res.status(400).json({ payload: "Ya existe un usuario registrado con ese nombre" });
      }
      password = generateHash(password);
      //let newCart = await cartService.addCart();
      let newUser = {
        name,
        phone,
        email,
        password,
        last_connection: new Date(),
        //cart: newCart._id,
      };
      //newUser = new UserDTOfirstLettertoUpperCase(newUser); Forces name first character to uppercase
      newUser = await userService.createUser(newUser);
      newUser = newUser.toJSON();
      newUser = new UserDTO(newUser); // replaces password with ******
      return res.status(200).json({ payload: "Felicitaciones! ya diste de alta tu cuenta en Beepsafe!" });
    }catch{
      let errorData = {
        title: "Error al dar de alta un usuario",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      return res.status(500).json({
        error: `Unexpected error registering user - Try later or contact administrator...!!!`,
      });
    }
  };

  static login = async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ payload: "Ingrese nombre y contraseña" });
    }
    try {
      let user = await userService.getUsersBy({ email });
      if (!user)
        return res
          .status(400)
          .send(
            `Credenciales incorrectas. No existe un usuario con ese mail!!!`
          );

      if (isValidPassword(password, user.password)) {
        //user = new UserDTO(user);
        user = { ...user };
        let token = jwt.sign(user, SECRET, { expiresIn: "24h" });
        res.cookie("beepcookie", token, {
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 60 * 60 * 24000, // 24 hora
        });

        await userService.updateUser(
          { email },
          { last_connection: new Date() }
        );
        return res.status(200).json({
          userLogged: user,
          token,
        });
      } else {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
    } catch (error) {
      let errorData = {
        title: "Error en el login",
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
      const token = req.cookies.beepcookie;
      if (!token) {
        return res.status(400).json({ error: "User is not logged in...!!!" });
      }
      // Graba `last_connection`
      const user = jwt.verify(token, SECRET);
      const email = user.email;
      await userService.updateUser({ email }, { last_connection: new Date() });
      // Borra la jwt cookie
      res.clearCookie("beepcookie");
      return res
        .status(200)
        .json({ message: `Bye ${user.name}, hope to see you back soon!` });
    } catch (error) {
      let errorData = {
        title: "Error logging out",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      return res.status(500).json({
        error: `Unexpected error logging out - Try later or contact administrator...!!!`,
      });
    }
  };

  static passwordReset = async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).send("Enter email");
    try {
      let user = await userService.getUsersBy({ email });
      if (!user) return res.status(400).send(`Mail not registered...!!!`);
      let tokenpwr = jwt.sign({ id: user._id, email: user.email }, SECRET, {
        expiresIn: 3600,
      });
      res.cookie("resetPasswordcookie", tokenpwr, {
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 60 * 60 * 1000, // 1 hora
      });

      const userjwt = jwt.verify(tokenpwr, SECRET, { algorithms: ["HS256"] });
      // Send email
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465, // usar 465 para SSL
        secure: true, // true para puerto 465, false para 587
        auth: {
          user: "javier.rojo66@gmail.com",
          pass: config.GMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      try {
        await transporter.sendMail({
          from: "Beepsafe javier.rojo66@gmail.com",
          to: user.email,
          subject: "Cambiar tu contraseña de Beepsafe",
          html: `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8" />
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f7f9fa;
                  color: #333;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  background-color: #fff;
                  max-width: 600px;
                  margin: 40px auto;
                  border-radius: 10px;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                  padding: 40px;
                }
                .logo {
                  display: block;
                  margin: 0 auto 30px;
                  max-width: 180px;
                }
                h1 {
                  color: #2c3e50;
                }
                p {
                  line-height: 1.6;
                  font-size: 16px;
                }
                .button {
                  display: inline-block;
                  background-color: #00a9b7;
                  color: #fff;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  margin-top: 20px;
                }
                .footer {
                  font-size: 12px;
                  color: #999;
                  margin-top: 40px;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Restablecé tu contraseña</h1>
                <p>Hola,</p>
                <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste vos, hacé clic en el botón de abajo:</p>
                <a href="http://localhost:52917/pages/passwordResetForm.html?token=${tokenpwr}" class="button">Cambiar contraseña</a>
                <p>Si no solicitaste este cambio, ignorá este correo. Tu cuenta está segura.</p>
                <div class="footer">
                  © BeepSafe 2025 · Este es un mensaje automático, no respondas este correo.
                </div>
              </div>
            </body>
          </html>`,
        });
      } catch (err) {
        console.error("Error al enviar el mail:", err);
        return res.status(500).json({ error: "No se pudo enviar el email." });
      }
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({
        payload: `Se envio un mail a  ${user.email}. Si no lo recibís, revisá tu casilla de correo no deseado. Sigue las instrucciones`,
      });
    } catch (error) {
      let errorData = {
        title: "Error al intentar cambiar la contraseña",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado - Intente nuevamente más tarde, o contacte al administrador...!!!`,
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

  static current = (req, res) => {
    let token = req.cookies["beepcookie"];
    try {
      let userJWT = jwt.verify(token, SECRET);
      //userJWT = new UserDTO(userJWT);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ userJWT });
    } catch (error) {
      let errorData = {
        title: "Logged users error",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      //customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(401).json({ userJWT: `${error}` }); // saque ,userSessions de atras de {error}
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
