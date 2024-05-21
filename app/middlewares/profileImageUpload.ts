import multer, { MulterError } from "multer";
import fs from "fs";
import path from "path";
import { Request, Express } from "express";
import { UserId } from "../../index";

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const dirPath = path.join(
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
    const filetype = file.mimetype;
    const fileformat = filetype.split("/")[1];

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

const profileUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const profileUploadUpdate = multer({
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
