const logger = require("../../config/logger");

const validatePostForm = (req, res, next) => {
  try {
    if (req.path == "/insertPost" && req.files.length == 0) {
      res.send("select at least one image");
    } else if (req.body.location.trim() == "") {
      res.send("Enter location!!!");
    } else {
      next();
    }
  } catch (error) {
    logger.error("middleware validatePostForm: " + error);
  }
};

module.exports = validatePostForm;
