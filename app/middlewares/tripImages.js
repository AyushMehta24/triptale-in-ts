const multer  = require('multer');
const fs=require('fs');
const path=require('path');
const conn = require("../config/mysql_connection");


    const  storage = multer.diskStorage({
        destination: (req, file, cb)=> {
          const coverfolder=req.user.userId;
          const tripid=req.body.tid;
          const userId=coverfolder.toString();
          const uploadDir = path.join(
          "images","trips","tripImages",tripid
          );
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null,uploadDir)

        },
        filename:  (req, file, cb) =>{
         cb(null,Date.now()+ "--" +file.originalname );
        },
      });
       

const upload = multer({ storage: storage });

const tripImages = (req, res, next) => {
  upload.array("tripmultiimage", 20)(req, res, (err) => {
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
        "video/mp4",
        "video/webm"
      ];
      const maxSize = 50 * 1024 * 1024; // 50MB

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

module.exports = tripImages;