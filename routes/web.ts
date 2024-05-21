import { Router, Request, Response } from "express";
import passport from "passport";
import posts from "./posts";
import userProfile from "./userProfile";
import bioProfile from "../app/middlewares/validation/bioProfile";
import authController from "../app/controllers/authController";
import mainController from "../app/controllers/mainController";
import guest from "../app/middlewares/guest";
import RegisterLogin from "../app/middlewares/validation/registerLogin";
import comboController from "../app/controllers/comboController";
import createtrip from "./createtrip";
import searchcontroller from "./search";
import create from "./create";
import { profileUpload } from "../app/middlewares/profileImageUpload";
import {
  firstTimeLogin,
  checkIsProfileFill,
} from "../app/middlewares/validation/firstTimeLogin";
import home from "./homeRoutes/home";
import app from "./displayTrip";

const web = Router();

web.get(
  "/",
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
  checkIsProfileFill,
  (req: Request, res: Response) => {
    mainController.getMain(req, res);
  }
);

web.get("/login", guest, authController().getLoginForm);
web.post("/login", RegisterLogin, authController().loginUser);
web.get("/register", guest, authController().getRegisterForm);
web.post("/register", RegisterLogin, authController().registerUser);
web.get("/activateuser", authController().activeUser);
web.get("/forgotpassword", guest, authController().getForm);
web.post("/forgotpassword", authController().forgotForm);
web.get("/changepassword", authController().getUpdatePassForm);
web.post("/changepassword", RegisterLogin, authController().UpdatePass);
web.get("/sessionexpired", (req: Request, res: Response) => {
  res.send("change Password Session Expired");
});

web.use(
  passport.authenticate("jwt", { session: false, failureRedirect: "/login" })
);
web.get("/profile", firstTimeLogin, (req: Request, res: Response) => {
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
web.use("/displayTrip", app);
web.use("/trips", createtrip);
web.use("/create", create);
web.use("/userProfile", userProfile);
web.get("/", mainController.getMain);

web.post(
  "/updateProfile",
  profileUpload.single("file_upload"),
  bioProfile,
  authController().UpdateProfile
);
web.get("/getProfile", authController().GetProfile);

web.use("/insight", require("./insight"));

web.use("/notification", require("./notification"));
web.get("/resetpassword", authController().GetResetPasswordForm);
web.post("/resetpassword", RegisterLogin, authController().resetPassword);
web.get("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/login");
});
web.get("/error", (req: Request, res: Response) => {
  res.render("components/error", { layout: "layouts/bioProfile" });
});
web.get("*", (req: Request, res: Response) => {
  res.render("components/404", { layout: "layouts/bioProfile" });
});

export default web;
