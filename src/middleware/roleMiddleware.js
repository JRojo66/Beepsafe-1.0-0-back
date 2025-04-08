import passport from "passport";

const roleMiddleware = (authorizedRoles) => {
  return (req, res, next) => {
    if(!req.user && req.headers.connection === "keep-alive"){
      res.setHeader('Content-Type','application/json');
      return res.status(403).json({error:`Not logged in users...!`})
    }
    
    if (req.headers.connection === "close"){
      passport.authenticate("current", { session: false })(req, res, () => {
        if (req.user && authorizedRoles.includes(req.user.role)) {
          next();
        } else {
          res.status(403).json({ message: "Your role is not authorized for this route." });
        }
      });    
    } else{
      if(req.user.loginStrategy === "jwt"){  
        passport.authenticate("current", { session: false })(req, res, () => {
          if (req.user && authorizedRoles.includes(req.user.role)) {
            next();
          } else {
            res.status(403).json({ message: "Your role is not authorized for this route." });
          }
        });
      }
      if(req.user.loginStrategy === "gitHub"){
        passport.authenticate("gitHub", { session: false })(req, res, () => {
          if (req.user && authorizedRoles.includes(req.user.role)) {
            next();
          } else {
            res.status(403).json({ message: "Your role is not authorized for this route." });
          }
        });
      }
    }
  }
};

export default roleMiddleware;