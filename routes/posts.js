const express = require("express");
const posts = express.Router();
const postController = require("../app/controllers/postController");
const postImageUpload = require("../app/middlewares/postsMiddlewares/postImageUpload");
const updatePostProtect = require("../app/middlewares/postsMiddlewares/updatePostProtect");
const validatePostForm = require("../app/middlewares/postsMiddlewares/validatePostForm");

posts.get("/insertform", postController().getPostInsertForm);
posts.post(
  "/insertPost",
  postImageUpload,
  validatePostForm,
  postController().insertPost
);
posts.get("/update", updatePostProtect, postController().updatePostForm);
posts.post("/update", updatePostProtect,validatePostForm, postController().updatePost);
posts.post("/delete", postController().deletePost);
// posts.post("/getprivacys", postController().getprivacys);
posts.post("/getuserusernames", postController().getUsersUserName);
posts.post("/getHashtags", postController().getHashTags);

module.exports = posts;
