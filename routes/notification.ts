import { Router } from "express";
import notificationController from "../app/controllers/notificationController";

const router = Router();

router.get("/", notificationController.getNotification);

router.post("/postUserId", notificationController.postUserId);

router.post(
  "/getCommentReplyNotification",
  notificationController.getCommentReplyNotification
);

export default router;
