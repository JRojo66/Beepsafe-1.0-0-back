import { Router } from "express";
import { __dirname } from "../utils.js";
import { CartController } from "../controller/CartController.js";
import passport from "passport";
import { TicketController } from "../controller/TicketController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

export const router = Router();

router.get("/", roleMiddleware(["admin"]), CartController.getAllCarts);
router.get("/:cid", roleMiddleware(["admin"]), CartController.getCartById);
router.post(
  "/:cid/product/:pid",
  roleMiddleware(["admin", "user", "premium"]),
  CartController.addProductInCart
);
router.put(
  "/:cid",
  roleMiddleware(["admin", "user", "premium"]),
  CartController.updateCart
);
router.put(
  "/:cid/products/:pid",
  roleMiddleware(["admin", "user", "premium"]),
  CartController.updateQty
);
router.delete(
  "/:cid/product/:pid",
  roleMiddleware(["admin", "user", "premium"]),
  CartController.deleteProduct
);
router.delete(
  "/:cid",
  roleMiddleware(["admin", "user", "premium"]),
  CartController.deleteAllProductsInCart
);
router.post(
  "/:cid/purchase",
  roleMiddleware(["admin", "user", "premium"]),
  TicketController.createTicket
);
