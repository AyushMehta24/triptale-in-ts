const router = require("express").Router();
const profileController = require("../app/controllers/profileController");



router.get("/", profileController().getUserProfilePage);
router.get("/editProfile", profileController().getEditProfilePage);
router.get("/fetchAlubams", profileController().fetchAlubums);
router.post("/createalubams", profileController().createAlbums);
router.get("/fetchPosts", profileController().fetchPosts);
router.get("/fetchPopupPost", profileController().fetchPopupPosts);
router.get("/fetchTagPosts", profileController().fetchTagePost);
router.get("/oneAlbumPost", profileController().fetchOneAlbumsPost);
router.post(
  "/removePostFromAlbums",
  profileController().deletePostIdFromalbum
);
router.post(
  "/otherPostShowInAlbums",
  profileController().otherPostShowInAlbums
);
router.post("/addPostInAlbums", profileController().addPostInAlbums);
router.get("/fetchDetails", profileController().fetchDetails);
router.post("/deleteAlbum", profileController().deleteAlbum);

router.post("/updateAlbumName",profileController().updateAlbumName);
router.post("/removePostFromAlbumsFromHome" ,profileController().deletePostInAlbumFromHome)
router.get(
  "/posts",
  profileController().onepost)

module.exports = router;