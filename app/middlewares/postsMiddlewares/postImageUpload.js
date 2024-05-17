const multer = require("multer");
const fs = require("fs");
const path = require("path");
const logger = require("../../config/logger");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const coverfolder = req.user.userId;
    const uploadDir = path.join("images", "posts", coverfolder.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const postImageUpload = (req, res, next) => {
  try {
   
    upload.array("images", 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
  
      const files = req.files;
      const errors = [];
  
      files.forEach((file) => {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/svg+xml",
          "video/mp4",
          "video/webm"
        ];
        const maxSize = 20 * 1024 * 1024; 
  
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
        logger.error(errors)
        return res.status(400).json({ errors });
      }
      req.files = files;
      next();
    });
  } catch (error) {
    logger.error("post image upload multer ,",error)
  }
  
};

module.exports = postImageUpload;
