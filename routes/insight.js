const router = require("express").Router();

const insightController = require("../app/controllers/insightController");
const triInsight=require('../app/middlewares/tripInsight')

router.get("/:id?", insightController().insightDashbord);

router.post("/insightDashbord/", insightController().insightDashbord);
router.post("/likeUserName", insightController().fetchUsernameLike);
router.post("/commentUserName", insightController().fetchUsernameComments);

// tripInsight
router.get("/tripInsight/:id?", triInsight,insightController().tripInsight);
router.post("/tripInsight/trip_members",insightController().tripMembers);


module.exports = router;
