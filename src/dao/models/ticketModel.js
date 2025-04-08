import mongoose from "mongoose";

const ticketCollection = "ticket";
const ticketSchema = new mongoose.Schema(
  {
    code: String,
    purchase_datetime: Date,
    amount: Number,
    purchaser: String,
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cart",
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        qty: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ticketModel = mongoose.model(ticketCollection, ticketSchema);
