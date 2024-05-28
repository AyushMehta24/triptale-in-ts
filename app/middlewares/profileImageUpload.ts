import multer, { Multer, MulterError, StorageEngine } from "multer";
import fs from "fs";
import path from "path";
import { Request, Express } from "express";
import { UserId } from "../../index";

const storage:StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const dirPath:string = path.join(
      __dirname,
      "..",
      "images",
      "profile",
      (req.user as UserId).userId.toString()
    );

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    cb(null, dirPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const filetype:string = file.mimetype;
    const fileformat:string = filetype.split("/")[1];

    cb(null, `${Date.now()}_${(req.user as UserId).userId}.${fileformat}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const profileUpload:Multer = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const profileUploadUpdate:Multer = multer({
  storage: storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb) => {
    if (file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export { profileUpload, profileUploadUpdate };
