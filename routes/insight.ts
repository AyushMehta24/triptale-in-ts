import { Router } from "express";
import insightController from "../app/controllers/insightController";
import triInsight from "../app/middlewares/tripInsight";

const router:Router = Router();

// const controller = insightController();

router.get("/:id?", insightController.insightDashbord);

router.post("/insightDashbord/", insightController.insightDashbord);
router.post("/likeUserName", insightController.fetchUsernameLike);
router.post("/commentUserName", insightController.fetchUsernameComments);

// tripInsight
router.get("/tripInsight/:id?", triInsight, insightController.tripInsight);
router.post("/tripInsight/trip_members", insightController.tripMembers);

export default router;
