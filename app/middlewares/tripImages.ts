import multer, { Multer, MulterError, StorageEngine } from "multer";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import conn from "../config/mysql_connection";
import { UserId } from "../../index";

const storage:StorageEngine = multer.diskStorage({
  destination: (req:Request, file, cb) => {
    const coverfolder:string = (req.user as UserId).userId;
    const tripid:string = req.body.tid;
    const userId:string = coverfolder.toString();
    const uploadDir:string = path.join("images", "trips", "tripImages", tripid);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req:Request, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload:Multer = multer({ storage: storage });

const tripImages = (req: Request, res: Response, next: NextFunction) => {
  upload.array("tripmultiimage", 20)(req, res, (err: any) => {
    if (err instanceof MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }

    const files = req.files as Express.Multer.File[];
    const errors: string[] = [];

    files.forEach((file) => {
      const allowedTypes:string[] = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "video/mp4",
        "video/webm",
      ];
      const maxSize:number = 50 * 1024 * 1024; // 50MB

      if (!allowedTypes.includes(file.mimetype)) {
        errors.push(`Invalid file type: ${file.filename}`);
      }

      if (file.size > maxSize) {
        errors.push(`File too large: ${file.originalname}`);
      }
    });

    if (errors.length > 0) {
      files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
      return res.status(400).json({ errors });
    }

    req.files = files;
    next();
  });
};

export default tripImages;
