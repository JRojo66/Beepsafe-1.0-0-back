import jwt from "jsonwebtoken";
import { SECRET, generateHash, isValidPassword } from "../utils.js";
import { userService } from "../services/UserService.js";

export class PasswordResetController {
  static pwr = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      let decoded = jwt.verify(token, SECRET);
      const email = decoded.email;
      const uid = decoded.id;
      if (!decoded) {
        res.setHeader("Content-Type", "application/json");
        return res.status(401).json({
          error: `No pudimos validar sus credenciales. Intentá nuevamente más tarde!!!`,
        });
      }
      let user = await userService.getUsersBy({ email });
      const oldPassword = user.password;
      if (isValidPassword(newPassword, oldPassword)) {
        res.setHeader("Content-Type", "application/json");
        return res.status(401).json({
          error: `la nueva contraseña debe ser diferente de la anterior...`,
        });
      }
      const password = generateHash(newPassword);

      await userService.updateUser({ _id: uid }, { password: password });
      res.setHeader("Content-Type", "application/json");
      return res
        .status(200)
        .json({ payload: "La clave se cambió correctamente...!!!" });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.setHeader("Content-Type", "application/json");
        return res.status(401).json({ Error: "El tiempo para cambiar la clave expiro... Volvé a generar el mail!!!" });
      } else {
        let errorData = {
          title: "Error reseting password",
          name: error.name,
          message: error.message,
          stack: error.stack,
          };
          customLogger.error(JSON.stringify(errorData, null, 5));
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
          Error: "Unexpected error - Try later or contact administrator...!!!",
        });
      }
    }
  };
}
