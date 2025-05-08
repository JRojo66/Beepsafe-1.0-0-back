import { userModel } from "./models/userModel.js";

export class UserDaoMONGO {
  create = async (user) => {
    return await userModel.create(user);
  };

  getBy = async (filter = {}) => {
    if (Object.keys(filter).length === 0) {
      // Si no hay filtro, devolvemos todos los usuarios
      return await userModel.find({}).lean();
    }
    // Si hay filtro, devolvemos un único usuario
    return await userModel.findOne(filter).lean();
  };
  

  // getBy = async (filter = {}) => {
  //   return await userModel.findOne(filter).lean();
  // };

  update = async (search, update) => {
    return await userModel.findOneAndUpdate(search, update);
  };


  
}
