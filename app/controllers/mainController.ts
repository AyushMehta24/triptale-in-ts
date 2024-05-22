import { Request, Response } from 'express';
import logger from '../config/logger';
import * as homeController from './homeControllers/homeController';

interface MainController {
  getMain(req: Request, res: Response): Promise<void>;
}

const mainController: MainController = {
  async getMain(req, res) {
    try {
      const showData = await homeController.getHome(req);
      res.render("components/home/homeMain", {
        showPosts: showData
      });
    } catch (error) {
      logger.error(`mainConteroller getMain function : ${error}` );
    }
  },
};

export default mainController;