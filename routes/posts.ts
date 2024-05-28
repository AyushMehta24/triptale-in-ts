import express, { Router } from "express";
import { Request, Response } from "express";
import postController from "../app/controllers/postController";
import postImageUpload from "../app/middlewares/postsMiddlewares/postImageUpload";
import updatePostProtect from "../app/middlewares/postsMiddlewares/updatePostProtect";
import validatePostForm from "../app/middlewares/postsMiddlewares/validatePostForm";

const posts:Router = express.Router();

posts.get("/insertform", (req: Request, res: Response) => {
  postController().getPostInsertForm(req, res);
});

posts.post(
  "/insertPost",
  postImageUpload,
  validatePostForm,
  (req: Request, res: Response) => {
    postController().insertPost(req, res);
  }
);

posts.get("/update", updatePostProtect, (req: Request, res: Response) => {
  postController().updatePostForm(req, res);
});

posts.post(
  "/update",
  updatePostProtect,
  validatePostForm,
  (req: Request, res: Response) => {
    postController().updatePost(req, res);
  }
);

posts.post("/delete", (req: Request, res: Response) => {
  postController().deletePost(req, res);
});

posts.post("/getuserusernames", (req: Request, res: Response) => {
  postController().getUsersUserName(req, res);
});

posts.post("/getHashtags", (req: Request, res: Response) => {
  postController().getHashTags(req, res);
});

export default posts;
