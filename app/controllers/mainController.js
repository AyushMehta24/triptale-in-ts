const logger = require("../config/logger");
const homeController = require("./homeControllers/homeController");


const mainController = () => {
  return {
    async getMain(req, res) {
      try {
        let showData = await homeController().getHome(req);
        res.render("components/home/homeMain", {
          showPosts: showData
  
        });
      } catch (error) {
        logger.error("mainConteroller getMain function :" + error.message)
      }
    },
  };
};

module.exports = mainController;
