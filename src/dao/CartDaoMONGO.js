import { cartModel } from "./models/cartModel.js";

export class CartDaoMONGO {
  add = async () => {
    const cartProducts = { products: [] };
    let newCart = await cartModel.create(cartProducts);
    return newCart.toJSON();
  };
  getAll = async () => {
    return await cartModel.find().lean();
  };

  getOneBy = async (filter) => {
    return await cartModel.findOne(filter).lean();
  };

  getBy = async (filter) => {
    return await cartModel.findOne(filter).populate("products.product").lean();
  };

  update = async (id, cart) => {
    return await cartModel.updateOne({ _id: id }, cart);
  };

  delete = async (cid, pid) => {
    return await cartModel.findByIdAndUpdate(
      cid,
      { $pull: { products: { product: pid } } },
      { new: true }
    );
  };
}
