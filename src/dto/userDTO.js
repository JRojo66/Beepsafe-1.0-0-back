// Hides password
export class UserDTO {
  constructor(user) {
        if(user){
        this.name = user.name;
        // this.lastName = user.lastName;
        this.email = user.email;
        // this.age = user.age;
        this.role = user.role;
        this.password = "********";
        this.last_connection = user.last_connection;
        this.cart = user.cart;
        this._id = user._id;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
        this.__v = user.__v;
    }
  }
}

let userFormatOK = new UserDTO({});

// Turns fist letter of name and last name to Capital letter
export class UserDTOfirstLettertoUpperCase {
    constructor(user) {
        if (user.name) {
            this.name = user.name.charAt(0).toUpperCase() + user.name.slice(1);
            this.email = user.email;
            // this.age = user.age;
            this.role = user.role;
            this.password = user.password;
            this.last_connection = user.last_connection;
            this.cart = user.cart;
            this._id = user._id;
            this.createdAt = user.createdAt;
            this.updatedAt = user.updatedAt;
            this.__v = user.__v;
        }
    }
}

let userFirstLetterOK = new UserDTOfirstLettertoUpperCase({});
