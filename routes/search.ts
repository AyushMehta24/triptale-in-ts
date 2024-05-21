import { Router, Request, Response } from "express";
import searchController from "../app/controllers/searchcontroller";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  searchController().getpage(req, res);
});

router.get("/posts", (req: Request, res: Response) => {
  searchController().onepost(req, res);
});

router.get("/profile", (req: Request, res: Response) => {
  searchController().getprofilepage(req, res);
});

router.post("/gethashtag", (req: Request, res: Response) => {
  searchController().getHashTags(req, res);
});

router.post("/getlocation", (req: Request, res: Response) => {
  searchController().getLocation(req, res);
});

router.post("/getusernames", (req: Request, res: Response) => {
  searchController().getUsersUserName(req, res);
});

router.post("/", (req: Request, res: Response) => {
  searchController().postsearchpage(req, res);
});

export default router;
