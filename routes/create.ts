import { Router, Request, Response } from "express";

const create:Router = Router();

create.get("/", (req: Request, res: Response) => {
  res.render("components/create/createOption");
});

export default create;
