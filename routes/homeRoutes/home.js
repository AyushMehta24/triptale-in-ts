const express = require("express");
const mainController = require("../../app/controllers/mainController");
const homeController = require("../../app/controllers/homeControllers/homeController");
const getUserInfo = require("../../app/controllers/homeControllers/likeCommenController");
const onePostDetails = require("../../app/controllers/homeControllers/postDetailsController");
const replyController = require("../../app/controllers/homeControllers/replyCommentController");
const home = express.Router();

home.get(
  "/",
  mainController().getMain
);
home.get("/getprofileimage", homeController().getProfile);
home.post("/", homeController().getLikeCount);

home.post("/likedby", getUserInfo().getLikedBy);
home.post("/commentby", getUserInfo().getCommentBy);
home.post("/comment", getUserInfo().getComment);
home.post("/onepost", onePostDetails().getDetails);
home.post("/deletecomment", getUserInfo().removeComment);
home.post("/replycomment", replyController().getReplyComment);
home.post("/replydelete", replyController().replyCommentDelete);

module.exports = home;
