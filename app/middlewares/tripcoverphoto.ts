import multer, { Multer, StorageEngine } from "multer";
import fs from "fs";
import path from "path";
import conn from "../config/mysql_connection";
import tripinsert from "../controllers/tripController";
import { UserId } from "../../index";

const storage:StorageEngine = multer.diskStorage({
  destination: async (req, file, cb) => {
    const coverfolder:string = (req.user as UserId).userId;
    const userId:string = coverfolder.toString();
    const uploadDir:string = path.join("images", "trips", "tripcover", userId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: async (req, file, cb) => {
    let filetype:string = file.mimetype;
    let fileformate:string = filetype.split("/")[1];
    cb(
      null,
      Date.now() + "--" + file.originalname.slice(0, 10) + "." + fileformate
    );
  },
});

const tripcoverupload:Multer = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export default tripcoverupload;
