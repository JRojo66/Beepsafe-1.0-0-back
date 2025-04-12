import passport from "passport";
import local from "passport-local";
import github from "passport-github2";
import passportJWT from "passport-jwt";
import { SECRET, generateHash, isValidPassword } from "../utils.js";
import { userService } from "../services/UserService.js";
import { cartService } from "../services/CartService.js";
import { UserDTO, UserDTOfirstLettertoUpperCase } from "../dto/userDTO.js";

const extractToken = (req) => {
  let token = null;
  if (req.cookies["codercookie"]) {
    token = req.cookies["codercookie"];
  } 
  return token;
};

export const initPassport = () => {
  passport.use(
    "register",
    new local.Strategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          let { name, phone } = req.body;
          let existsEmail = await userService.getUsersBy({ email: username });
          let existsName = await userService.getUsersBy({ name: name });
          if (existsEmail) {
            return done(null, false, { message: 'Ya hay una cuenta registrada con ese email' }); // Añade un objeto info
          }
          if (existsName) {
            return done(null, false, { message: 'El nombre elegido ya está en uso. Elegí uno diferente' }); // Añade un objeto info
          }
          password = generateHash(password);
          //let newCart = await cartService.addCart();
          let newUser = {
            name,
            phone,
            email: username,
            password,
            last_connection: new Date(),
            //cart: newCart._id,
          };
          //newUser = new UserDTOfirstLettertoUpperCase(newUser); Forces name first character to uppercase
          newUser = await userService.createUser(newUser);
          newUser = newUser.toJSON();
          newUser = new UserDTO(newUser); // replaces password with ******
          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new local.Strategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          let user = await userService.getUsersBy({ email: username });
          if (!user || !user.password) {
            return done(null, false);
          }
          if (!isValidPassword(password, user.password)) {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new github.Strategy(
      {
        clientID: "Iv23lilw42OZu4xXKicA",
        clientSecret: "22bca2a20c3dda4b5b5b9ca2d19ac00275eb297b",
        callbackURL: "/api/sessions/callBackGithub",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let name = profile._json.name;
          let email = profile._json.email;
          if (!name || !email) {
            return done(null, false);
          }
          let user = await userService.getUsersBy({ email });
          if (!user) {
            //let newCart = await cartService.addCart();
            user = await userService.createUser({
              name,
              email,
              profile,
              //cart: newCart._id,
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "current",
    new passportJWT.Strategy(
      {
        secretOrKey: SECRET,
        jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([
          extractToken,
        ]),
      },
      async (tokenContent, done) => {
        try {
          return done(null, tokenContent);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

passport.serializeUser((user, done) => {
  return done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  let user = await userService.getUsersBy({ _id: id });
  return done(null, user);
});
