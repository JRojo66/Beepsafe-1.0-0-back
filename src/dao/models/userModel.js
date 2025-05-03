// models/User.js
import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: String,
  description: String,
  photo: String, // path al archivo o URL
}, { _id: false });

const activitySchema = new mongoose.Schema({
  name: String,
  equipment: [equipmentSchema],
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  phone: Number,
  password: String,
  last_connection: Date,
  role: { type: String, default: "user" },
  documents: {
    type: [{
      name: String,
      reference: String,
    }],
    default: [
      { name: "identificacion", reference: "" },
      { name: "comprobanteDeDomicilio", reference: "" },
      { name: "combrobanteDeEstadoDeCuenta", reference: "" },
    ],
  },
  loginStrategy: { type: String, default: "jwt" },
  activities: [activitySchema], // 👈 nueva propiedad
}, { timestamps: true });

export const userModel = mongoose.model("users", userSchema);

