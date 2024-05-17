const router = require("express").Router();
const searchcontroller = require('../app/controllers/searchcontroller');


router.get(
    "/", 
    searchcontroller().getpage
  );
  
router.get(
  "/posts",
 searchcontroller().onepost
);
router.get(
  "/profile",
 searchcontroller().getprofilepage
);
router.post(  
  "/gethashtag",
 searchcontroller().getHashTags
 );
 router.post(
  "/getlocation",
 searchcontroller().getLocation
 ); 
 router.post(
  "/getusernames",
 searchcontroller().getUsersUserName
)


router.post(
   "/",
   searchcontroller().postsearchpage
  );

  module.exports = router;