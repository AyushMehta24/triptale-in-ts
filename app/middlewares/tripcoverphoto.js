const multer  = require('multer');
const fs=require('fs');
const path=require('path');
const conn = require("../config/mysql_connection");
const tripinsert=require('../controllers/tripController');

    const  storage = multer.diskStorage({
        destination: async function (req, file, cb) {
          const coverfolder=req.user.userId;
          const userId=coverfolder.toString();
          const uploadDir = path.join(
          "images","trips","tripcover",userId
          );
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null,uploadDir)
        },
        filename:async function (req, file, cb) {

          let filetype = file.mimetype;
          let fileformate = filetype.split("/")[1];
         cb(null,Date.now()+ "--" +file.originalname.slice(0,10) +"."+fileformate);
        },
      });
      
      const tripcoverupload=multer({
        storage:storage,
        filefilter:(req,file,cb)=>{
          if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
        },
      })
      
      
    
    
      module.exports = tripcoverupload;