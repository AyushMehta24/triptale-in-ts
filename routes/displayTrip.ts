import { Router } from "express";
import path from "path";
import express from "express";
import displayTripsControllers from "../app/controllers/displayTripsControllers";
import tripChatProtect from "../app/middlewares/tripChatProtect";
import tripDetailsProtect from "../app/middlewares/tripDetailsProtect";
import tripImagesProtect from "../app/middlewares/tripImagesProtect";

const app = Router();

app.use(express.static(path.join(__dirname, "/displayTrips")));

// const allTrips = displayTripsControllers();

app.get("/", displayTripsControllers.getTrips);

app.get("/:tid", tripDetailsProtect, displayTripsControllers.tripDetails);

app.get(
  "/images/:tid/:did",
  tripImagesProtect,
  displayTripsControllers.tripImages
);

app.get("/chat/:tid", displayTripsControllers.tripChatUI);

app.post("/gettripchat", tripChatProtect, displayTripsControllers.getTripChat);
app.post(
  "/insertripchat",
  tripChatProtect,
  displayTripsControllers.insertTripChat
);

export default app;
