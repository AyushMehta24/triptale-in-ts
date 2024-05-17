const app = require("express").Router();
const con = require("../app/config/mysql_connection");
const allTrips = require("../app/controllers/displayTripsControllers");

const path = require("path");
const express = require("express");
const tripChatProtect = require("../app/middlewares/tripChatProtect");
const tripDetailsProtect = require("../app/middlewares/tripDetailsProtect");
const tripImagesProtect = require("../app/middlewares/tripImagesProtect");

app.use(express.static(path.join(__dirname + "/displayTrips")));

app.get("/", allTrips().getTrips);

app.get("/:tid",tripDetailsProtect, allTrips().tripDetails);

app.get("/images/:tid/:did",tripImagesProtect,allTrips().tripImages);

app.get("/chat/:tid",allTrips().tripChatUI);

app.post("/gettripchat", tripChatProtect, allTrips().getTripChat);
app.post("/insertripchat", tripChatProtect, allTrips().insertTripChat);

module.exports = { app };
