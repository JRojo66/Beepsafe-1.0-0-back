// controllers/ActivitiesController.js
import { userService } from "../services/UserService.js";

export class ActivitiesController {
    async createActivity(req, res) {
    const { email, activity } = req.body;

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
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }
}

export const activitiesController = new ActivitiesController();
