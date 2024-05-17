const express = require("express");
const app = express();
require("dotenv").config();
const web = require("./routes/web");
const expresslayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const passport = require("passport");


const server = app.listen(process.env.PORT || 3002);

const io = require("socket.io")(server);

app.set("socketio", io);
io.on("connection", (socket) => {
  socket.on("notification-message", (msg) => {
    socket.broadcast.emit(`notification-like-${msg.id}`, msg.data, msg.content,msg.flag);
  });
  socket.on("trip-chat-message", (msg) => {
    socket.broadcast.emit(`trip-chat-${msg.tripId}`, msg);
  });
  socket.on("comment", (data) => {
    socket.broadcast.emit(`comment-${data.id}`, data.data);
  });
});

app.use(passport.initialize());
app.use(expresslayout);
app.set("layout", "./layouts/mainLayout.ejs");
app.use(cookieParser());
app.use(express.static("images"));
app.use(express.static("public"));
app.use(express.static("public"));
app.use(express.static("node_modules/sweetalert2/dist"));
app.use(express.static("node_modules/socket.io/client-dist"));
app.use(express.static("node_modules/flowbite/dist"));
app.use(express.static("node_modules/emoji-picker-element"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", web);
