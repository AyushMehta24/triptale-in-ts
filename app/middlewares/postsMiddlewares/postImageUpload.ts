import multer, { StorageEngine } from "multer";
import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import logger from "../../config/logger";
import { UserId } from "../../../index";

// Define the storage engine with disk storage
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    try {
      const coverfolder = (req.user as UserId).userId;
      const uploadDir = path.join("images", "posts", coverfolder.toString());
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      logger.error("Error in destination function: ", error);
      cb(error instanceof Error ? error : new Error("Unknown error"), "");
    }
  },
  filename: (req: Request, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Create the multer upload middleware
const upload = multer({ storage: storage });

// Define the postImageUpload middleware function
const postImageUpload = (req: Request, res: Response, next: NextFunction) => {
  try {
    upload.array("images", 5)(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const files = req.files as Express.Multer.File[];
      const errors: string[] = [];

      files.forEach((file) => {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/svg+xml",
          "video/mp4",
          "video/webm",
        ];
        const maxSize = 20 * 1024 * 1024; // 20MB

        if (!allowedTypes.includes(file.mimetype)) {
          errors.push(`Invalid file type: ${file.originalname}`);
        }

        if (file.size > maxSize) {
          errors.push(`File too large: ${file.originalname}`);
        }
      });

      if (errors.length > 0) {
        files.forEach((file) => {
          fs.unlinkSync(file.path);
        });
        logger.error(errors);
        return res.status(400).json({ errors });
      }
      req.files = files;
      next();
    });
  } catch (error) {
    logger.error("Post image upload multer error: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default postImageUpload;
