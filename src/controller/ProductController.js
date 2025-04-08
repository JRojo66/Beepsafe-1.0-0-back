import { productService } from "../services/ProductService.js";
import { isValidObjectId } from "mongoose";
import { validationProducts } from "../utils/validation.js";
import { config } from "../../src/config/config.js";

export class ProductController {
  static getProducts = async (req, res) => {
    let pquery;
    let limit = 100;
    let page = 1;
    let query = {};
    let sort = {};
    let prevLink = "";
    let nextLink = "";

    if (req.query.limit) {
      limit = Number(req.query.limit);
      if (isNaN(limit)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "The 'limit' parameter must be a number" });
      }
    }

    if (req.query.page) {
      page = Number(req.query.page);
      if (isNaN(page)) {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "The 'page' parameter must be a number" });
      }
    }

    if (req.query.query) {
      let queryObject = {};
      try {
        queryObject = JSON.parse(req.query.query);
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({
          error: "Query param is not a JSON - please modify and try again",
        });
      }

      if (typeof queryObject === "object") {
        query = queryObject;
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "The 'query' parameter must be a JSON" });
      }
    }

    if (req.query.sort) {
      let sortObject = {};
      try {
        sortObject = JSON.parse(req.query.sort);
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({
          error: "Sort param is not a JSON - please modify and try again",
        });
      }

      if (typeof sortObject === "object") {
        sort = sortObject;
      } else {
        res.setHeader("Content-Type", "application/json");
        return res
          .status(400)
          .json({ error: "The 'sort' parameter must be a JSON" });
      }
    }
    try{
      pquery = await productService.getProductsPaginated(
        query,
        limit,
        page,
        sort
      );
    } catch(error){
      let errorData = {
      title: "Error getting paginated products",
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

    if (!pquery.hasPrevPage) {
      prevLink = null;
    } else {
      prevLink = `${config.ROOT_URL}/api/products?page=${
        page - 1
      }&limit=${limit}&query=${encodeURIComponent(
        JSON.stringify(query)
      )}&sort=${encodeURIComponent(JSON.stringify(sort))}`;
    }

    if (!pquery.hasNextPage) {
      nextLink = null;
    } else {
      nextLink = `${config.ROOT_URL}/api/products?page=${
        page + 1
      }&limit=${limit}&query=${encodeURIComponent(
        JSON.stringify(query)
      )}&sort=${encodeURIComponent(JSON.stringify(sort))}`;
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      status: 200,
      payload: pquery.docs,
      totalPages: pquery.totalPages,
      prevPage: pquery.prevPage,
      nextPage: pquery.nextPage,
      hasPrevPage: pquery.hasPrevPage,
      hasNextPage: pquery.hasNextPage,
      prevLink,
      nextLink,
    });
  };

  static getProductById = async (req, res) => {
    let id = req.params.id;
    id = Number(id);
    if (isNaN(id)) {
      return res.json({ error: "Pls, enter a numeric id..." });
    }
    try {
      let product = await productService.getProductBy({ id: id });
      if (!product) {
        return res.json({ message: `id ${id} not found` });
      } else {
        res.json({ product, user: req.user });
      }
    } catch (error){
      let errorData = {
        title: "Error getting product by id",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
      return res.json({ error: "Unkwown error params" });
    }
  };

  static createProduct = async (req, res) => {
    let {
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    } = req.body;

    let status = true;

    let owner = req.user.email;

    const errors = validationProducts(
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    );

    if (errors.length > 0) {

      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: errors });
    }
    let exists;
    try {
      exists = await productService.getProductBy({ code });
    } catch (error) {
      let errorData = {
        title: "Error creating product",
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
    if (exists) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `Product with code ${code} already exists` });
    }

    try {
      let productAdded = await productService.addProduct({
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        owner,
        thumbnails,
      });
      let newProduct = await productService.getAllProducts();
      req.serverSocket.emit("newProduct", title);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ payload: productAdded });
    } catch (error) {
      let errorData = {
        title: "Error adding product when creating it",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
      res.setHeader("Content-Type", "application/json");
      res.status(500).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
  };

  static updateProduct = async (req, res) => {
    let { pid } = req.params;
    if (!isValidObjectId(pid)) {
      return res.status(400).json({
        error: `Enter a valid id`,
      });
    }

    let updatedProduct = req.body;

    if (updatedProduct._id) {
      delete updatedProduct._id;
    }

    if (updatedProduct.code) {
      let exist;
      try {
        exist = await productService.getProductBy({
          code: updatedProduct.code,
        });
        if (exist) {
          return res.status(400).json({
            error: `A product with the code ${updatedProduct.code} already exists`,
          });
        }
      } catch (error) {
        let errorData = {
          title: "Error updating product 1",
          name: error.name,
          message: error.message,
          stack: error.stack,
          };
          customLogger.error(JSON.stringify(errorData, null, 5));
        return res.status(500).json({
          error: `${error.message}`,
        });
      }
    }

    try {
      let product = await productService.getProductBy({ _id: pid });
      if (req.user.email !== product.owner && req.user.name !== "admin") {
        return res.json({
          payload: `Only the product owner can delete this product...!!!`,
        });
      }
      const products = await productService.updateProducts(pid, updatedProduct);
      return res.json(products);
    } catch (error) {
      let errorData = {
        title: "Error updating product 2",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
      res.status(300).json({
        error: `Unexpected server error - Try again later or contact admninistrator`,
      });
    }
  };

  static deleteProduct = async (req, res) => {
    let { pid } = req.params;
    console.log(pid);                                                                                       //clg
    if (!isValidObjectId(pid)) {
      return res.status(400).json({
        error: `Enter a valid id`,
      });
    }
    try {
      let product = await productService.getProductBy({ _id: pid });
      if (req.user.email !== product.owner && req.user.name !== "Admin") {
        return res.json({
          payload: `Only the product owner can delete this product...!!!`,
        });
      }
      if (product) {
        await productService.deleteProduct(pid);
        req.serverSocket.emit(
          "deletedProduct",
          await productService.getAllProducts()
        );
        return res.json({ payload: `Product ${pid} deleted` });
      } else {
        return res.status(404).json({ error: `${pid} inexistent` });
      }
    } catch (error) {
      let errorData = {
        title: "Error deleting product",
        name: error.name,
        message: error.message,
        stack: error.stack,
        };
        customLogger.error(JSON.stringify(errorData, null, 5));
      return res.status(500).json({ error: `Error deleting product ${pid}` });
    }
  };
}
