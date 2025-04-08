import { productService } from "../services/ProductService.js";
import { cartService } from "../services/CartService.js";
import jwt from "jsonwebtoken";
import { SECRET } from "../utils.js";

export class ViewsController {
  static home = async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.status(200).render("home", {});
  };

  static createProduct = async (req, res) => {
    res.status(200).render("createProduct");
  };

  static products = async (req, res) => {
    try {
      let query = {};
      let page = 1; // page by default
      let limit = 2; // limit by default
      let sort = { price: -1 }; // sort by default
      if (req.query.page) {
        page = req.query.page;
      }
      let user = req.user;
      let token = req.cookies["codercookie"];
      let products = await productService.getProductsPaginated(
        query,
        limit,
        page,
        sort
      );
      let cartId = user.cart;
      res.setHeader("Content-Type", "text/html");
      res.status(200).render("products", { products, user, cartId });
    } catch (error) {
      let errorData = {
        title: "error fetching products",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
      res.status(500).send("Error fetching products");
    }
  };

  static realTimeProducts = async (req, res) => {
    let rtproducts;
    try {
      rtproducts = await productService.getAllProducts();
      res.setHeader("Content-Type", "text/html");
      res.status(200).render("realtime", { rtproducts });
    } catch (error) {
      let errorData = {
        title: "error getting products for rendering real time products",
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
    
    let { cid } = req.params;
//    let token = req.cookies["codercookie"];
    let user = req.user;
    try{
      let cart = await cartService.getCartBy({ _id: cid });
      res.setHeader("Content-Type", "text/html");
       return res.status(200).render("cart", { cart, user });
    }catch(error){
      let errorData = {
        title: "error getting cart id for rendering cart",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
    }
  };

  static register = async (req, res) => {
    res.status(200).render("register");
  };

  static login = async (req, res) => {
    let { error } = req.query;
    res.status(200).render("login", { error });
  };

  static login = async (req, res) => {
    let { error } = req.query;
    res.status(200).render("login", { error });
  };

  static logout = async (req, res) => {
    let { error } = req.query;
    res.status(200).render("logout", { error });
  };

  static loginGitHub = async (req, res) => {
    let { error } = req.query;
    res.status(200).render("loginGitHub", { error });
  };

  static passwordReset = async (req, res) => {
    res.status(200).render("passwordReset");
  };

  static passwordResetForm = async (req, res) => {
    res.status(200).render("passwordResetForm");
  };

  static attachFiles = async (req, res) => {
    res.status(200).render("attachFiles");
  };

  static attachFilesProfile = async (req, res) => {
    res.status(200).render("attachFilesProfile");
  };

  static attachFilesProduct = async (req, res) => {
    res.status(200).render("attachFilesProduct");
  };

  static attachFilesIdentification = async (req, res) => {
    res.status(200).render("attachFilesIdentification");
  };

  static attachFilesAddressProof = async (req, res) => {
    res.status(200).render("attachFilesAddressProof");
  };

  static attachFilesBankStatement = async (req, res) => {
    res.status(200).render("attachFilesBankStatement");
  };

  static chat = async (req, res) => {
    res.status(200).render("chat");
  };

}
