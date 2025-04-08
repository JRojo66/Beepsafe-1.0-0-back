import { ticketModel } from "../dao/models/ticketModel.js";
import { cartService } from "../services/CartService.js";
import { ticketService } from "../services/TicketService.js";
import { userService } from "../services/UserService.js";
import { productService } from "../services/ProductService.js";
import { customLogger } from "../utils.js";
import { config } from "../config/config.js";
import nodemailer from "nodemailer";

export class TicketController {
  static createTicket = async (req, res) => {
    try {
      const code = new Date().getTime();
      let { cid } = req.params;
      let user = await userService.getUsersBy({ cart: cid });
      if (!user) {
        return res.status(404).json({ error: `Cart ${cid} not found...!` });
      }

      const userEmail = user.email;

      let cart = await cartService.getCartBy({ _id: cid });

      if (cart.products.length === 0) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: `Empty cart request...!` });
      }

      let available = [];
      let notAvailable = [];
      let amount = 0;
      for (let i = 0; i < cart.products.length; i++) {
        let pid = cart.products[i].product._id;
        let product = await productService.getProductBy({ _id: pid });
        if (product.stock >= cart.products[i].qty) {
          available.push({ product: pid, qty: cart.products[i].qty });
          amount = amount + product.price * cart.products[i].qty;
          product.stock = product.stock - cart.products[i].qty;
          await productService.updateProducts(pid, product);
        } else {
          notAvailable.push({ product: pid, qty: cart.products[i].qty });
        }
      }

      if (available.length > 0) {
        let newTicket = {
          code,
          amount,
          purchaser: userEmail,
          cart: cid,
          products: available,
        };
        await ticketService.addTicket(newTicket);

        let lastTicket = await ticketModel.findOne({ code });
        await ticketService.update(code, lastTicket.createdAt);

        await cartService.updateCart(cid, {
          products: notAvailable,
        });

        if (notAvailable.length > 0) {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            port: "587",
            auth: {
              user: "javier.rojo66@gmail.com",
              pass: config.GMAIL_PASS,
            },
          });
          transporter.sendMail({
            from: "rojozon javier.rojo66@gmail.com",
            to: userEmail,
            subject: "Your purchase in Rojozon",
            html: `<h3>Thank you for shopping in Rojozon. Your purchase was received. Your ticket nr is ${code} </h3>`,
          });
          return res.status(201).json({
            message: `Ticket code: ${code} created...!!! Unfortunately, some products are out of stock. We will keep them in your cart for future purchases`,
          });
        } else {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            port: "587",
            auth: {
              user: "javier.rojo66@gmail.com",
              pass: config.GMAIL_PASS,
            },
          });
          transporter.sendMail({
            from: "rojozon javier.rojo66@gmail.com",
            to: userEmail,
            subject: "Your purchase in Rojozon",
            html: `<h3>Thank you for shopping in Rojozon. Your purchase was received. Your ticket nr is ${code} </h3>`,
          });
          return res.status(201).json({
            message: `Ticket code: ${code} created...!!!`,
          });
        }
      } else {
        return res.status(404).json({
          message: `All products are out of stock...!!! Products were not available and will remain in your cart for next purchase`,
        });
      }
    } catch (error) {
      let errorData = {
        title: "Error creating ticket",
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      customLogger.error(JSON.stringify(errorData, null, 5));
      return res.json({
        error:
          `Unexpected server error - Try again later or contact admninistrator`
      });
    }
  };
}
