import express, { Request, Response } from "express";
import mainController from "../../app/controllers/mainController";
import * as homeController from "../../app/controllers/homeControllers/homeController";
import * as getUserInfo from "../../app/controllers/homeControllers/likeCommenController";
import * as onePostDetails from "../../app/controllers/homeControllers/postDetailsController";
import * as replyController from "../../app/controllers/homeControllers/replyCommentController";

const home = express.Router();

home.get("/", (req: Request, res: Response) => {
  mainController.getMain(req, res);
});

home.get("/getprofileimage", (req: Request, res: Response) => {
  homeController.getProfile(req, res); // Ensure homeController has getProfile method
});

home.post("/", (req: Request, res: Response) => {
  homeController.getLikeCount(req, res);
});

home.post("/likedby", (req: Request, res: Response) => {
  getUserInfo.getLikedBy(req, res);
});

home.post("/commentby", (req: Request, res: Response) => {
  getUserInfo.getCommentBy(req, res);
});

home.post("/comment", (req: Request, res: Response) => {
  getUserInfo.getComment(req, res);
});

home.post("/onepost", (req: Request, res: Response) => {
  onePostDetails.getDetails(req, res);
});

home.post("/deletecomment", (req: Request, res: Response) => {
  getUserInfo.removeComment(req, res);
});

home.post("/replycomment", (req: Request, res: Response) => {
  replyController.getReplyComment(req, res);
});

home.post("/replydelete", (req: Request, res: Response) => {
  replyController.replyCommentDelete(req, res);
});

export default home;
