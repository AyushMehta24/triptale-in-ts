const router = require("express").Router();
const passport = require("passport");
const multer = require("multer");
require("../app/config/passport")(passport);
const tripprotect=require("../app/middlewares/tripprotect");
const daysInsert=require("../app/middlewares/protectDaysInsert");
const guest = require("../app/middlewares/guest");
const tripEvent = require("../app/middlewares/validation/tripEvent")
const tripinsert = require("../app/controllers/tripController");
const tripMemberProtect = require("../app/middlewares/tripChatProtect");

const tripcoverupload = require("../app/middlewares/tripcoverphoto");
const tripImages = require("../app/middlewares/tripImages");
const tripDaysProtect = require("../app/middlewares/tripDaysProtect");
const { eventImageUpload } = require("../app/middlewares/tripEventsCover");
const tripDetailsProtect = require("../app/middlewares/tripDetailsProtect");
const tripEventUpdateProtect = require("../app/middlewares/tripEventUpdateProtect");

router.get("/createtrip", tripinsert().createTrip);
router.post(
  "/uploadtrip",
  tripcoverupload.single("tripimage"),
  tripinsert().tripDetails
);
router.post("/uploadday", tripImages, tripinsert().daybydayinsert);
router.get("/insertdays/:tid",daysInsert, tripinsert().dayByDay);

router.post("/getlocation", tripinsert().getLocation);
router.get("/editmembers/:tid", tripinsert().editmembers);
router.post("/editmembers/:tid",tripMemberProtect, tripinsert().editMembersPost);
router.post("/addmembers/:tid",tripMemberProtect, tripinsert().addMembersPost);
router.post("/newmemberremove/:tid",tripMemberProtect, tripinsert().newMemberRemove);

router.post("/removeimage",tripinsert().removeImage);
router.post("/addimage",tripImages,tripinsert().addImage);

router.post("/removetrip", tripinsert().removeTrip)
router.post("/leavetrip", tripinsert().leaveTrip)

router.post("/deleteday",tripDaysProtect,tripinsert().deleteTripDay);
router.get("/updateday",tripDaysProtect,tripinsert().updateDayForm);
router.post("/updateday",tripDaysProtect,tripinsert().updateDay);
router.get('/updatetrip',tripprotect,tripinsert().updateTrip);
router.post('/updatetripdata',tripprotect,tripinsert().updateTripData);
router.get("/eventcreate/:tid",tripDetailsProtect,tripinsert().getCreateEventForm)
router.post("/eventcreate/:tid",tripDetailsProtect,eventImageUpload.single("image"),tripEvent,tripinsert().createvent)
router.get("/eventupdate",tripEventUpdateProtect,tripinsert().fetchTripEventDetails)
router.post("/eventupdate",tripEventUpdateProtect,eventImageUpload.single("image"),tripEvent,tripinsert().updateeventtrip);
router.post("/eventdelete",tripEventUpdateProtect,tripinsert().deleteTripEvent)

module.exports = router;
