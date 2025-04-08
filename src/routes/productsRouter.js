import { Router } from "express";
import { __dirname } from "../utils.js";
export const router = Router();
import { ProductController } from "../controller/ProductController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

router.get(
  "/",
  roleMiddleware(["admin", "user", "premium"]),
  ProductController.getProducts
);
router.get(
  "/:id",
  roleMiddleware(["admin", "user", "premium"]),
  ProductController.getProductById
);
router.post(
  "/",
  roleMiddleware(["admin", "premium", "user"]),
  ProductController.createProduct
);
router.put(
  "/:pid",
  roleMiddleware(["admin", "premium"]),
  ProductController.updateProduct
);
router.delete(
  "/:pid",
  roleMiddleware(["admin", "premium"]),
  ProductController.deleteProduct
);
