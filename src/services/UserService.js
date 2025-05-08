import { UserDaoMONGO as UserDao } from "../dao/UserDaoMONGO.js";

class UserService {
  constructor(dao) {
    this.dao = dao;
  }
  getUsersBy = async (filter = {}) => {
    return this.dao.getBy(filter);
  };

  createUser = async (user) => {
    return this.dao.create(user);
  };

  updateUser = async (search, update) => {
    return this.dao.update(search, update);
  };
}

  // deleteUserActivity = async (searchEmail, searchActivity) => {
  //   return this.dao.delete(searchEmail, searchActivity);
  // };


export const userService = new UserService(new UserDao());
