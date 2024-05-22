import { Request, Response, NextFunction } from "express";
import logger from "../../config/logger";

const validatePostForm = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.path === "/insertPost" && req.files?.length === 0) {
      res.send("Select at least one image");
    } else if (req.body.location.trim() === "") {
      res.send("Enter location!!!");
    } else {
      next();
    }
  } catch (error) {
    logger.error("middleware validatePostForm: " + error);
  }
};

export default validatePostForm;
