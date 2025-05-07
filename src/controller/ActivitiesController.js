// controllers/ActivitiesController.js
import { createLogger } from "winston";
import { userService } from "../services/UserService.js";

export class ActivitiesController {
    async createActivity(req, res) {
    const { activity } = req.body;
    const email = req.user.email;
        

    if (!email || !activity) {
      return res.status(400).json({ message: "Faltan campos requeridos." });
    }

    try {
      const user = await userService.getUsersBy({ email });

      if (!user || user.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const yaExiste = user.activities?.some(
        (act) => act.name.toLowerCase() === activity.toLowerCase()
      );

      if (yaExiste) {
        return res.status(400).json({ message: "Actividad ya registrada." });
      }

      const nuevasActividades = [...(user.activities || []), { name: activity }];

      await userService.updateUser({ email }, { activities: nuevasActividades });

      return res.status(200).json({ message: "Actividad agregada con éxito." });
    } catch (err) {
      console.error("Error al guardar actividad:", err);
      return res.status(500).json({ message: "Error interno del servidor al agregar la actividad." });
    }
  }

  async getAllActivities(req, res) {
    try {
      const allUsers = await userService.getUsersBy();
      const userArray = Array.isArray(allUsers) ? allUsers : [allUsers];
  
      const allActivities = userArray.flatMap((user) => user.activities || []);
      const uniqueNames = [...new Set(allActivities.map((a) => a.name))];
  
      return res.status(200).json(uniqueNames);
    } catch (err) {
      console.error("Error al obtener actividades:", err);
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }
  

  async getActivitiesByEmail(req, res) {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ message: "Falta el parámetro 'email'." });
    }

    try {
      const user = await userService.getUsersBy({ email });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const activities = (user.activities || []).map((act) => act.name);
      res.status(200).json(activities);
    } catch (err) {
        console.log("xxx");
      console.error("Error al obtener actividades del usuario:", err);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }

}

export const activitiesController = new ActivitiesController();
