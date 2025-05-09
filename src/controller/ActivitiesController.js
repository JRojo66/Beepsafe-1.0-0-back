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

      const nuevasActividades = [
        ...(user.activities || []),
        { name: activity },
      ];

      await userService.updateUser(
        { email },
        { activities: nuevasActividades }
      );

      return res.status(200).json({ message: "Actividad agregada con éxito." });
    } catch (err) {
      console.error("Error al guardar actividad:", err);
      return res
        .status(500)
        .json({
          message: "Error interno del servidor al agregar la actividad.",
        });
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

  async deleteActivity(req, res) {    
    const { email, activity } = req.body;
    if (!email || !activity) {
      return res
        .status(400)
        .json({ message: "Faltan datos para eliminar la actividad." });
    }
    try {
      const user = await userService.getUsersBy({ email }) 
      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado." });
      const initialCount = user.activities.length;
      const updatedActivities = user.activities.filter(
        (a) => a.name !== activity
      );
      if (updatedActivities.length === initialCount) {
        return res.status(404).json({ message: "Actividad no encontrada." });
      }
      await userService.updateUser(
        { email },
        { activities: updatedActivities }
      );
      return res.status(200).json({
        message: "Actividad eliminada correctamente.",
        activities: updatedActivities, // opcional, útil si querés actualizar el frontend
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error interno al eliminar la actividad." });
    }
  }

  async deleteEquipmentFromActivity(req, res) {
    const { email, activity, equipmentName } = req.body;
  
    if (!email || !activity || !equipmentName) {
      return res.status(400).json({ message: "Faltan datos para eliminar el equipo." });
    }
  
    try {
      const user = await userService.getUsersBy({ email });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
  
      const updatedActivities = user.activities.map((a) => {
        if (a.name === activity) {
          return {
            ...a,
            equipment: a.equipment.filter((eq) => eq.name !== equipmentName),
          };
        }
        return a;
      });
  
      await userService.updateUser({ email }, { activities: updatedActivities });
  
      res.status(200).json({ message: "Equipo eliminado correctamente." });
    } catch (err) {
      console.error("Error al eliminar equipo:", err);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
  

  async addEquipmentToActivity(req, res) {
    const { email, activity, equipment } = req.body;
  
    if (!email || !activity || !equipment || !equipment.name) {
      return res.status(400).json({ message: "Datos incompletos para agregar equipo." });
    }
  
    try {
      const user = await userService.getUsersBy({ email });
  
      if (!user) return res.status(404).json({ message: "Usuario no encontrado." });
  
      const updatedActivities = user.activities.map((a) => {
        if (a.name === activity) {
          return {
            ...a,
            equipment: [...(a.equipment || []), equipment],
          };
        }
        return a;
      });
  
      await userService.updateUser({ email }, { activities: updatedActivities });
  
      res.status(200).json({ message: "Equipo agregado con éxito." });
    } catch (err) {
      console.error("Error al agregar equipo:", err);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  }
  


}

export const activitiesController = new ActivitiesController();
