const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

import UserSchema from "../schema/UserSchema";

module.exports = function (passport) {
  passport.serializeUser(function (obj, done) {
    done(null, obj);
  });

  passport.deserializeUser(function (obj, done) {
    done(null, obj);
  });

  passport.use(
    "local-login",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password", passReqToCallback: true },
      async (req, email, password, done) => {
        const admin = await UserSchema.findOne({
          where: { email, role: "admin", status: { [Op.or]: [1, 0] } },
          raw: true,
        }).catch(() => null);
        if (admin === null) {
          return done(null, false, req.flash("message", "Admin does not exist"));
        }
        try {
          if (await bcrypt.compare(password, admin.password)) {
            return done(null, admin);
          } else {
            return done(null, false, req.flash("message", "Oops! Wrong password."));
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
