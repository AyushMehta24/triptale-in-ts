import express, { Application } from "express";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import web from "./routes/web";
import expressLayouts from "express-ejs-layouts";
import cookieParser from "cookie-parser";
import passport from "passport";
import cors from "cors"



dotenv.config();

const app: Application = express();

const corsOptions = { 
  // origin:'https://abc.onrender.com',
  AccessControlAllowOrigin: '*',  
  origin: '*',  
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' 
}
app.use(cors(corsOptions))
const server = app.listen(process.env.PORT || 3002 , ()=>{
  console.log(`sercver is running on port ${process.env.PORT || 3002}`);
});
const io: Server = new Server(server);

app.set("socketio", io);

io.on("connection", (socket: Socket) => {
  socket.on(
    "notification-message",
    (msg: string, data: string, flag: string) => {
      socket.broadcast.emit(`notifiaction-like-${msg}`, data, flag);
    }
  );
  socket.on("trip-chat-message", (msg: string) => {
    socket.broadcast.emit(`trip-chat-${msg}`);
  });
  socket.on("comment", (data: string) => {
    socket.broadcast.emit(`comment-${data}`);
  });
});

app.use(passport.initialize());
app.use(expressLayouts);
app.set("layout", "./layouts/mainLayout");
app.use(cookieParser());
app.use(express.static("images"));
app.use(express.static("public"));
app.use(express.static("node_modules/sweetalert2/dist"));
app.use(express.static("node_modules/socket.io/client-dist"));
app.use(express.static("node_modules/flowbite/dist"));
app.use(express.static("node_modules/emoji-picker-element"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", web);





