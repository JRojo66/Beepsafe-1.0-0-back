import { Router } from "express";
import { __dirname } from "../utils.js";
import { ViewsController } from "../controller/ViewsController.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

export const router = Router();

router.get("/", ViewsController.home);
router.get(
  "/createProduct",
  roleMiddleware(["admin", "premium", "user"]),
  ViewsController.createProduct
);
router.get(
  "/products",
  roleMiddleware(["admin","premium", "user"]),
  ViewsController.products
);
router.get(
  "/users/documents",
  roleMiddleware(["admin", "premium", "user"]),
  ViewsController.attachFiles
);
router.get(
  "/users/documents/profile",
  roleMiddleware(["admin", "premium", "user"]),
  ViewsController.attachFilesProfile
);
router.get(
  "/users/documents/product",
  roleMiddleware(["admin", "premium", "user"]),
  ViewsController.attachFilesProduct
);
router.get(
  "/users/documents/identification",
  roleMiddleware(["admin", "premium", "user"]),
  ViewsController.attachFilesIdentification
);
router.get(
  "/users/documents/addressProof",
  roleMiddleware(["admin", "premium", "user"]),
  ViewsController.attachFilesAddressProof
);
router.get(
  "/users/documents/bankStatement",
  roleMiddleware(["admin", "premium", "user"]),
  ViewsController.attachFilesBankStatement
);
router.get("/realtimeproducts", ViewsController.realTimeProducts);
router.get(
  "/cart/:cid",
  roleMiddleware(["admin", "premium", "user"]),
  ViewsController.getCartById
);
router.get("/register", ViewsController.register);
router.get("/login", ViewsController.login);
router.get("/logout", ViewsController.logout);
router.get("/login/github", ViewsController.loginGitHub);
router.get("/passwordReset", ViewsController.passwordReset);
router.get("/passwordResetForm", ViewsController.passwordResetForm);
router.get("/chat", roleMiddleware(["premium", "user"]), ViewsController.chat);

export default router;
