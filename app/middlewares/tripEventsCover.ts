import multer, { Multer, FileFilterCallback, StorageEngine } from "multer";
import fs from "fs";
import path from "path";
import logger from "../config/logger";
import { Request } from "express";

const storage:StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    try {
      const tid:string = req.params.tid ?? req.query.tid ?? "";
      let uploadDir:string = path.join(
        "images",
        "trips",
        "tripsevents",
        tid.toString()
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      logger.error(error);
      cb(error as Error, ""); // Pass the error object to the callback
    }
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    let filetype:string = file.mimetype;
    let fileformate:string = filetype.split("/")[1];
    const tid:string = req.params.tid ? req.params.tid : req.query.tid as string;
    cb(null, `${Date.now()}_${tid}.${fileformate}`);
  },
});

const eventImageUpload: Multer = multer({
  storage: storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    try {
      if (
        // file.mimetype === "image/jpg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb(null, false); // Pass null as the error to indicate invalid file type
      }
    } catch (error) {
      logger.error(error);
      cb(null, false);
    }
  },
});

export default eventImageUpload;
