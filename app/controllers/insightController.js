const conn = require("../config/mysql_connection");
const logger = require("../config/logger");

const insightController = () => {
  return {
    async insightDashbord(req, res) {
      try {
        let insightDashbord = await conn.query(
          `SELECT like_count,comment_count FROM posts where user_id=? and id=? and isdeleted is null;`,
          [req.user.userId, req.params.id]
        );
        if(insightDashbord[0].length !=0){
        let insightPost = await conn.query(
          `SELECT * FROM posts join post_images on posts.id=post_images.post_id  where posts.id=? and isdeleted is null limit 1 ;`,
          [req.params.id]
        );
        res.render("components/insight/insightful", {insightPost:insightPost[0][0],insightDashbord:insightDashbord[0][0],type:"",id:req.params.id
      })
        }else{
          res.redirect('/')
        }
      
      } catch (error) {
        logger.error("insightController insightDashbord function: ", error);
        res.redirect('/error')
      }
    },
    async fetchUsernameLike(req, res) {
      try {
        let fetchUsernameLike = await conn.query(
          `SELECT username, profile_image,concat(first_name , " ", last_name) as name FROM post_likes inner join user_profiles  where post_likes.liked_by=user_profiles.user_id  and post_likes.post_id = ? and post_likes.isdeleted is null;`,
          [req.body.postId]
        );

        res.json({ result: fetchUsernameLike[0] });
      } catch (error) {
        logger.error("insightController fetchUsernameLike function: ", error);
        res.redirect('/error')
      }
    },
    async fetchUsernameComments(req, res) {
      try {
        let fetchUsernameLike = await conn.query(
          `SELECT username,comments ,profile_image,concat(first_name , " ", last_name) as name FROM post_comment inner join user_profiles  where post_comment.comment_by=user_profiles.user_id  and post_comment.post_id =? and post_comment.deleted_at is null;`,
          [req.body.postId]
        );
        res.json({ result: fetchUsernameLike[0] });
      } catch (error) {
        logger.error(
          "insightController fetchUsernameComments function: ",
          error
        );
        res.redirect('/error')
      }
    },

    async tripInsight(req, res) {
      try {
        let tripInsight = await conn.query(
          `SELECT * FROM trip_details where trip_id=?`,
          [req.params.id]
        );
        let tripDayInsight = await conn.query(
          `SELECT * FROM trip_details inner join trip_days on trip_details.trip_id=trip_days.trip_id  where trip_details.trip_id=1 ;`,
          [req.params.tripId])

        let totaldays = await conn.query(
          `SELECT count(*)as totaldays FROM trip_days where trip_id=?`,
          [req.params.id]
        );

        let totalevents = await conn.query(
          ` SELECT count(*) as totalevents FROM trip_events where trip_id=? and deleted_at is null`,
          [req.params.id]
        );

        let totalmembers = await conn.query(
          ` SELECT count(*) AS totalmembers FROM trip_members where trip_id=? and deleted_at is null`,
          [req.params.id]
        );

        let totalimage = await conn.query(
          `select count(*) as totalimage from trip_days join trip_images on trip_days.id = trip_images.day_id where trip_days.trip_id = ? and trip_images.deleted_at is null`,
          [req.params.id]
        );

        res.render("components/insight/insightful", {
          id: req.params.id,
          tripInsight:tripInsight[0][0],
          totaldays: totaldays[0][0],
          totalevents: totalevents[0][0],
          totalmembers: totalmembers[0][0],
          totalimage: totalimage[0][0],
          type: "trip",
        });
      } catch (error) {
        logger.error("insightController tripInsight function: ", error);
        res.redirect('/error')
      }
    },
    async tripMembers(req, res) {
      try {
        
     
      let trip_members = await conn.query(
        `SELECT profile_image,concat(first_name , "",last_name) as name , username FROM trip_members join user_profiles on trip_members.user_id=user_profiles.user_id where trip_id=? and deleted_at is null;`,
        [req.body.postId]
      );

      res.json({result:trip_members[0]})
    } catch (error) {
      logger.error("insightController tripMembers function: ", error);
      res.redirect('/error')
    }
    },

  };
};

module.exports = insightController;
