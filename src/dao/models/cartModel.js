import mongoose from "mongoose";

const cartCollection = "cart";
const cartSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          product: {
            type: mongoose.Types.ObjectId,
            ref: "products", // products = productsModel name
          },
          qty: Number,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const cartModel = mongoose.model(cartCollection, cartSchema);
