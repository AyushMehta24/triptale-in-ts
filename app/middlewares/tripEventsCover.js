const multer = require("multer");
const fs = require("fs");
const path = require("path")
const logger = require("../config/logger");

const storage = multer.diskStorage({
 
  destination: (req, file, cb) => {
    try {
    const tid = req.params.tid?req.params.tid:req.query.tid;
    let uploadDir = path.join("images", "trips","tripsevents", tid.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
    } catch (error) {
      logger.error(error)
    }
   
  },
  filename: (req, file, cb) => {
    let filetype = file.mimetype;
    let fileformate = filetype.split("/")[1];
    const tid = req.params.tid?req.params.tid:req.query.tid;
    cb(null, Date.now()+"_"+tid + "." + fileformate);
  },
});

  const eventImageUpload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      try {
        if (
          // file.mimetype === "image/jpg" ||
          file.mimetype === "image/png" ||
          file.mimetype === "image/jpeg"
        ) {
          cb(null, true);
        } else {
          cb(new Error("Invalid file type"),false);
        } 
      } catch (error) {
        logger.error(error)
      }
    },
  });
  module.exports = { eventImageUpload };



