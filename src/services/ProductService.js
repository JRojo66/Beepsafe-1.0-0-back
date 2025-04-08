import { ProductDaoMONGO as ProductDao } from "../dao/ProductDaoMONGO.js";

class ProductService {
  constructor(dao) {
    this.dao = dao;
  }
  getProductBy = async (filter) => {
    return this.dao.getBy(filter);
  };
  addProduct = async (
    title,
    description,
    code,
    price,
    status = true,
    stock,
    category,
    thumbnails = []
  ) => {
    return this.dao.add(
      title,
      description,
      code,
      price,
      (status = true),
      stock,
      category,
      (thumbnails = [])
    );
  };
  getAllProducts = async () => {
    return this.dao.getAll();
  };
  getProductsPaginated = async (query, limit, page, sort) => {
    return this.dao.getPaginated(query, limit, page, sort);
  };
  updateProducts = async (id, productData) => {
    return this.dao.update(id, productData);
  };
  deleteProduct = async (productId) => {
    return this.dao.delete(productId);
  };
}

export const productService = new ProductService(new ProductDao());
