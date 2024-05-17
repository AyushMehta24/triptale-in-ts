const logger = require("../../config/logger");

function RegisterLogin(req, res, next) {
    try {
        let { email, password, conform_password ,CurrentPassword} = req.body;
    if (req.path == "/register") {
        if (!email.trim() || !password.trim() || !conform_password.trim()) {
            return res.send({ success: false, alert: "Enter All Details" });
        }
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email.trim())) {
            return res.send({
                success: false,
                alert: "Enter Email in Proper Format",
            });
        }
        if (passwordValidate(password) != "") {
            return res.send({
                success: false,
                alert: passwordValidate(password),
            });
        }
        if (password !== conform_password) {
            return res.send({
                success: false,
                alert: "Confirm Password Not Matched Try Again",
            });
        }
        next();
    }

    if (req.path == "/login") {
        if (!email.trim() || !password.trim()) {
            return res.send({ success: false, alert: "Enter All Details" });
        }
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email.trim())) {
            return res.send({
                success: false,
                alert: "Enter Email in Proper Format",
            });
        }
        next();
    }
    if (req.path == "/resetpassword") {
        if (!password.trim() || !conform_password.trim() || !CurrentPassword.trim()) {
            return res.send({ success: false, alert: "Enter All Details" });
        }
        if (passwordValidate(password) != "") {
            return res.send({
                success: false,
                alert: passwordValidate(password),
            });
        }
        if (password !== conform_password) {
            return res.send({
                success: false,
                alert: "Confirm Password Not Matched Try Again",
            });
        }
        next()
    }

    if (req.path == "/changepassword") {
        if (!password.trim() || !conform_password.trim()) {
            return res.send({ success: false, alert: "Enter All Details" });
        }
        if (passwordValidate(password) != "") {
            return res.send({
                success: false,
                alert: passwordValidate(password),
            });
        }
        if (password !== conform_password) {
            return res.send({
                success: false,
                alert: "Confirm Password Not Matched Try Again",
            });
        }
        next()
    }
    } catch (error) {
        logger.error(error)
        return res.send({ success: false, alert: "Something went wrong" });
    }
}

function passwordValidate(pass){
    if (pass.length <6 || pass.length >12) {
      return "* must between 6 to 12 characters"
    }else if(!pass.match(/(?=.*[a-z])/)){
      return "* At least one lowercase letter"
    }else if(!pass.match(/(?=.*[A-Z])/)){
      return "* At least one uppercase letter"
    }else if(!pass.match(/(?=.*\d)/)){
      return "* At least one digit required"
    }
    return ""
}
module.exports = RegisterLogin;