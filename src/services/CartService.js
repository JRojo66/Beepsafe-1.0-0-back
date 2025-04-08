import { CartDaoMONGO as CartDao } from "../dao/CartDaoMONGO.js";

class CartService {
  constructor(dao) {
    this.dao = dao;
  }
  addCart = async () => {
    return this.dao.add();
  };
  getAllCarts = async () => {
    return this.dao.getAll();
  };
  getOneCartBy = async (filter) => {
    return this.dao.getOneBy(filter);
  };
  getCartBy = async (filter) => {
    return this.dao.getBy(filter);
  };
  updateCart = async (id, cart) => {
    return this.dao.update(id, cart);
  };
  deleteProductInCart = async (cid, pid) => {
    return this.dao.delete(cid, pid);
  };
}

export const cartService = new CartService(new CartDao());
