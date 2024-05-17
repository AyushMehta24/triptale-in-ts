const create = require("express").Router();

create.get("/", (req, res) => {
  res.render("components/create/createOption");
});
module.exports = create;
