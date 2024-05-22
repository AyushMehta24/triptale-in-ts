import { Router } from "express";
import multer from "multer";
import configurePassport from "../app/config/passport";
import tripProtect from "../app/middlewares/tripprotect";
import daysInsert from "../app/middlewares/protectDaysInsert";
import tripEvent from "../app/middlewares/validation/tripEvent";
import tripInsert from "../app/controllers/tripController";
import tripMemberProtect from "../app/middlewares/tripChatProtect";
import tripCoverUpload from "../app/middlewares/tripcoverphoto";
import tripImages from "../app/middlewares/tripImages";
import tripDaysProtect from "../app/middlewares/tripDaysProtect";
import  eventImageUpload  from "../app/middlewares/tripEventsCover";
import tripDetailsProtect from "../app/middlewares/tripDetailsProtect";
import tripEventUpdateProtect from "../app/middlewares/tripEventUpdateProtect";

configurePassport();

const router = Router();

router.get("/createtrip", tripInsert().createTrip);
router.post(
  "/uploadtrip",
  tripCoverUpload.single("tripimage"),
  tripInsert().tripDetails
);
router.post("/uploadday", tripImages, tripInsert().daybydayinsert);
router.get("/insertdays/:tid", daysInsert, tripInsert().dayByDay);

router.post("/getlocation", tripInsert().getLocation);
router.get("/editmembers/:tid", tripInsert().editmembers);
router.post(
  "/editmembers/:tid",
  tripMemberProtect,
  tripInsert().editMembersPost
);
router.post("/addmembers/:tid", tripMemberProtect, tripInsert().addMembersPost);
router.post(
  "/newmemberremove/:tid",
  tripMemberProtect,
  tripInsert().newMemberRemove
);

router.post("/removeimage", tripInsert().removeImage);
router.post("/addimage", tripImages, tripInsert().addImage);

router.post("/removetrip", tripInsert().removeTrip);
router.post("/leavetrip", tripInsert().leaveTrip);

router.post("/deleteday", tripDaysProtect, tripInsert().deleteTripDay);
router.get("/updateday", tripDaysProtect, tripInsert().updateDayForm);
router.post("/updateday", tripDaysProtect, tripInsert().updateDay);
router.get("/updatetrip", tripProtect, tripInsert().updateTrip);
router.post("/updatetripdata", tripProtect, tripInsert().updateTripData);
router.get(
  "/eventcreate/:tid",
  tripDetailsProtect,
  tripInsert().getCreateEventForm
);
router.post(
  "/eventcreate/:tid",
  tripDetailsProtect,
  eventImageUpload.single("image"),
  tripEvent,
  tripInsert().createvent
);
router.get(
  "/eventupdate",
  tripEventUpdateProtect,
  tripInsert().fetchTripEventDetails
);
router.post(
  "/eventupdate",
  tripEventUpdateProtect,
  eventImageUpload.single("image"),
  tripEvent,
  tripInsert().updateeventtrip
);
router.post(
  "/eventdelete",
  tripEventUpdateProtect,
  tripInsert().deleteTripEvent
);

export default router;
