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

      res.status(200).json(user.activities);
    } catch (err) {
      console.error("Error al obtener actividades del usuario:", err);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }

  // async deleteActivity(req, res) {
  //   const { email, activity } = req.body;
  //   console.log("email", email);
  //   console.log("activity", activity);

  //   if (!email || !activity) {
  //     return res.status(400).json({ message: "Faltan datos para eliminar la actividad." });
  //   }

  //   try {
  //     const user = await userModel.findOne({ email });
  //     if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

  //     const initialCount = user.activities.length;
  //     user.activities = user.activities.filter((a) => a.name !== activity);

  //     if (user.activities.length === initialCount) {
  //       return res.status(404).json({ message: "Actividad no encontrada." });
  //     }

  //     await user.save();
  //     return res.status(200).json({ message: "Actividad eliminada correctamente." });
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).json({ message: "Error interno al eliminar la actividad." });
  //   }
  // }

}

export const activitiesController = new ActivitiesController();
