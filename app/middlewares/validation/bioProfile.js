const logger = require("../../config/logger");

function bioProfile(req, res, next) {
  let { first_name, last_name, user_dob, gender, city_id } = req.body;
  let istrue = true;

 
  
  try {
    const validate_date = (date) => {
      let dateRegx = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;

      if (!dateRegx.test(date)) {
        istrue = false;
      }
    };

    const alphabetic = (string) => {
      let regex = /^[a-zA-Z]+$/;
      if (!regex.test(string)) {
        istrue = false;
      }
    };

    if (
      first_name.trim() == "" ||
      last_name.trim() == "" ||
      user_dob.trim() == "" ||
      gender.trim() == "" ||
      city_id.trim() == ""
    ) {
      istrue = false;
    } else {
      validate_date(user_dob.trim());

      if (first_name.trim() == "" || last_name.trim() == "") {
        alphabetic(first_name.trim());
        alphabetic(last_name.trim());
      }
    }

    if (istrue) {
      next();
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    logger.error("middleware validation bioprofile: " + error.message)
  }
}

module.exports = bioProfile;
