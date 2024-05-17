const web = require("express").Router();
const passport = require("passport");
const posts = require("./posts");
require("../app/config/passport")(passport);
const userProfile = require("./userProfile");

const bioProfile=require('../app/middlewares/validation/bioProfile')

const authController = require("../app/controllers/authController");
const mainController = require("../app/controllers/mainController");
const guest = require("../app/middlewares/guest");
const RegisterLogin = require("../app/middlewares/validation/registerLogin");

const comboController = require("../app/controllers/comboController");

const createtrip = require("./createtrip");
const searchcontroller = require("./search");
const create = require("./create");
const { profileUpload } = require("../app/middlewares/profileImageUpload");
const {
  firstTimeLogin,
  checkIsProfileFill,
} = require("../app/middlewares/validation/firstTimeLogin");
const home = require("./homeRoutes/home");

const { app } = require("./displayTrip");

web.get(
  "/",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  checkIsProfileFill,
  mainController().getMain
);

web.get("/login", guest, authController().getLoginForm);
web.post("/login",RegisterLogin, authController().loginUser);
web.get("/register", guest, authController().getRegisterForm);
web.post("/register", RegisterLogin, authController().registerUser);
web.get("/activateuser", authController().activeUser);
web.get("/forgotpassword", guest, authController().getForm);
web.post("/forgotpassword", authController().forgotForm);
web.get("/changepassword", authController().getUpdatePassForm);
web.post("/changepassword",RegisterLogin, authController().UpdatePass);
web.get("/sessionexpired", (req, res) => {
  res.send("change Password Session Expired");
});

web.use(
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" })
);
web.get("/profile", firstTimeLogin, (req, res) => {
  res.render("components/auth/profileDetails", {
    layout: "layouts/bioProfile",
    type: "",
  });
});

web.post(
  "/addProfile",
  profileUpload.single("file_upload"),
  bioProfile,
  authController().InsertProfile
);
web.post("/countries", comboController().countries);
web.post("/state", comboController().states);
web.post("/city", comboController().cities);
web.post("/checkUsername", comboController().checkUsername);

web.use(checkIsProfileFill);

web.use("/posts", posts);
web.use("/home", home);
web.use("/search", searchcontroller);
//trip display ayush f6
web.use("/displayTrip", app);
// create trip
web.use("/trips", createtrip);
web.use("/create", create);
web.use("/userProfile", userProfile);
web.get("/", mainController().getMain);

web.post(
  "/updateProfile",
  profileUpload.single("file_upload"),
  bioProfile
  ,
  authController().UpdateProfile
);
web.get("/getProfile", authController().GetProfile);

//forgot password

//search section

web.use("/insight", require("./insight"));

web.use("/notification", require("./notification"));
web.get("/resetpassword", authController().GetResetPasswordForm);
web.post("/resetpassword",RegisterLogin, authController().resetPassword);
web.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});
web.get("/error",(req,res)=>{
  res.render("components/error",{layout:"layouts/bioProfile"})
})
web.get("*", (req, res) => {
  res.render("components/404", { layout: "layouts/bioProfile" });
});

module.exports = web;
