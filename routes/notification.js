const router = require("express").Router();
const notification=require('../app/controllers/notificationController')

router.get("/",notification().getNotification);

router.post('/postUserId',notification().postUserId)

router.post('/getCommentReplyNotification',notification().getCommentReplyNotification)

module.exports=router
