import mongoose from "mongoose";

const usersCollection = "users";
const usersSchema = new mongoose.Schema(
  {
    name: String,
    lastName: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: Number,
    password: String,
    last_connection: Date,
    role: {
      type: String,
      default: "user",
    },
    // cart: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "cart",
    // },
    activities: {
      activity: Object,
    },
    documents: {
        type: [{
            name: String,
            reference: String
          },
        ],
        default: [{
          name:"identificacion",
          reference:""},
          {
          name:"comprobanteDeDomicilio",
          reference:""
          },
          {
          name:"combrobanteDeEstadoDeCuenta",
          reference:""
          },
        ]
    },
    loginStrategy: {
      type: String,
      default: "jwt"
    }
  },
  {
    timestamps: true,
    strict: false,
  }
);

export const userModel = mongoose.model(usersCollection, usersSchema);
