import { cartService } from "../services/CartService.js";
import { productService } from "../services/ProductService.js";
import { isValidObjectId } from "mongoose";
import { customLogger } from "../utils.js";


export class CartController {
  static getAllCarts = async (req, res) => {
    try {
      let cart = await cartService.getAllCarts();
      if (req.query.limit) {
        const limit = Number(req.query.limit);
        if (isNaN(limit)) {
          res.setHeader("Content-Type", "application/json");
          return res
            .status(400)
            .json({ error: "The 'limit' parameter must be a number" });
        }
        cart = cart.slice(0, limit);
      }
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(cart);
    } catch (error) {
      let errorData = {
        title: "Error accesing Carts DB",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
  };

  static getCartById = async (req, res) => {
    let cid = req.params.cid;
    if (!isValidObjectId(cid)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: "Pls, enter a valid id..." });
    }
    try {
      let cart = await cartService.getCartBy({ _id: cid });
      if (!cart) {
        res.setHeader("Content-Type", "application/json");
        return res.status(404).json({ message: `cart id ${cid} not found` });
      } else {
        res.json(cart);
      }
    } catch (error) {
      let errorData = {
        title: "Error accesing Carts DB by id",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Unkwown error params" });
    }
  };

  static addProductInCart = async (req, res) => {
    let { cid, pid } = req.params;
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Not valid cid/pid` });
    }
    let cart = await cartService.getOneCartBy({ _id: cid });
    if (!cart) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ payload: `Can't find Cart id ${cid}` });
    }
    try {
      let product = await productService.getProductBy({ _id: pid });
      if (!product) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ payload: `Can't find product id ${pid}` });
      }
      if (product.owner === req.user.email) {
        return res.status(401).json({
          payload: `Can't buy your own products... Doesn't make sense, ask Coderhouse why...`,
        });
      }
      let productIndex = cart.products.findIndex((p) => p.product == pid);
      if (productIndex === -1) {
        cart.products.push({ product: pid, qty: 1 });
      } else {
        cart.products[productIndex].qty++;
      }
      let result = await cartService.updateCart(cid, cart);
      if (result.modifiedCount > 0) {
        res.setHeader("Content-Type", "application/json");
        return res.status(200).json({payload: "Cart updated"});
      } else {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).json({
          error: `Unexpected server error - Try later or contact administrator`,
          detalle: `Could not update...!`,
        });
      }
    } catch (error){
      let errorData = {
        title: "Error adding product in cart",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Unkwown error params" });
    }
  };

  static updateCart = async (req, res) => {
    let { cid } = req.params;
    if (!isValidObjectId(cid)) {
      return res
        .status(500)
        .json({ error: `cart id must be a valid MongoDB _id` });
    }
    let cartExists;
    cartExists = await cartService.getCartBy({ _id: cid });
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(404)
        .json({ error: `There is no cart with id: ${cid}` });
    }
    let newProducts = req.body;
    try{
    const newCart = await cartService.updateCart(cid, newProducts);
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(`Cart ${cid} updated`);
    } catch(error){
      let errorData = {
        title: "Error updating cart",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Unkwown error params" });

    }
  };

  static updateQty = async (req, res) => {
    let { cid, pid } = req.params;
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res
        .status(500)
        .json({ error: `cart and products id must be valid MongoDB _ids` });
    }
    let exists;
    try {
      exists = await productService.getProductBy({ _id: pid });
    } catch (error) {
      let errorData = {
        title: "Error getting product for updating cart qty",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
    if (!exists) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `There is no Product with id: ${pid}` });
    }
    let cartExists;
    cartExists = await cartService.getCartBy({ _id: cid });
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(404)
        .json({ error: `There is no cart with id: ${cid}` });
    }
    let newQty = req.body.qty;
    if (typeof newQty !== "number") {
      return res.status(500).json({ error: `qty must be a number` });
    }
    try {
      let productExists = false;
      let cart = await cartService.getOneCartBy({ _id: cid });
      cart.products.forEach((element) => {
        if (element.product == pid) {
          element.qty = newQty;
          productExists = true;
        }
      });
      if (!productExists) {
        return res.status(500).json({
          error: `There is no product ${pid} does not exist in cart ${cid}`,
        });
      }
      let newProducts = { products: cart.products };
      const newCart = await cartService.updateCart(cid, newProducts);
      return res.json(`Updated cart: ${pid} with qty: ${newQty}`);
    } catch (error) {
      let errorData = {
        title: "Error accessing cart for updating cart quantity",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
  };

  static deleteProduct = async (req, res) => {
    let { cid, pid } = req.params;
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res
        .status(400)
        .json({ error: `cart and products id be valid Mongo ObjectIds` });
    }
    let existsInProducts;
    try {
      existsInProducts = await productService.getProductBy({ _id: pid });
    } catch (error) {
      let errorData = {
        title: "Error getting product for deleting product in cart",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
    if (!existsInProducts) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(404)
        .json({ error: `There is no Product with id: ${pid}` });
    }
    let cartExists;
    try {
      cartExists = await cartService.getOneCartBy({ _id: cid });
    } catch (error) {
      let errorData = {
        title: "Error accessing cart to update",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(404)
        .json({ error: `There is no cart with id: ${cid}` });
    }
    let productIndex = cartExists.products.findIndex((p) => p.product == pid);
    if (productIndex === -1) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(404)
        .json({ error: `There is no product ${pid} in cart ${cid}` });
    }
    try {
      let cartUpdated = await cartService.deleteProductInCart(cid, pid);
      res.json(`${pid} deleted from cart: ${cid}`);
    } catch (error) {
      let errorData = {
        title: "Error deleting product in cart in the database",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      return res.json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
  };

  static deleteAllProductsInCart = async (req, res) => {
    let { cid } = req.params;
    if (!isValidObjectId(cid)) {
      return res
        .status(400)
        .json({ error: `cart id must be valid Mongo ObjectId` });
    }
    let cartExists;
    try {
      cartExists = await cartService.getCartBy({ _id: cid });
    } catch (error) {
      let errorData = {
        title: "Error getting cart by cart id to delete all products in cart",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(404)
        .json({ error: `There is no cart with id: ${cid}` });
    }
    let newProducts = { products: [] };
    try{
      const newCart = await cartService.updateCart(cid, newProducts);
      res.setHeader("Content-Type", "application/json");
      return res.json(`Products in cart ${cid} were deleted`);
    } catch(error){
      let errorData = {
        title: "Error getting cart by cart id to delete all products in cart",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    };
  }
}
