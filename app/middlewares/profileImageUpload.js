const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    path=`images/profile/${req.user.userId}/`
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
    
    cb(null, path);
  },
  filename: (req, file, cb) => {
    let filetype = file.mimetype;
    let fileformate = filetype.split("/")[1];
    
    cb(null, Date.now()+"_"+req.user.userId + "." + fileformate);
  },
});

const profileUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const profileUploadUpdate = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/png" 
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});



module.exports = { profileUpload };
