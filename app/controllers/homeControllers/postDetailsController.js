const logger = require("../../config/logger");
const connection = require("../../config/mysql_connection");

const onePostDetails = () => {
  return {
    async getDetails(req, res) {
      try {
        const id = req.body.postId;
        const postDetailsQuery = "select user.username, posts.location, posts.like_count, posts.comment_count, posts.descriptions,posts.ismultiple, post_images.image, user.profile_image, post_images.isvideo from posts inner join users_auth on posts.user_id = users_auth.id inner join user_profiles user on user.user_id = users_auth.id inner join post_images on post_images.post_id = posts.id where posts.id = ?"
  
        const hashtagQuery  = "select name from hashtags inner join post_hashtags on post_hashtags.tag = hashtags.id where post_hashtags.post_id = ?"

        const tagPeopleQuery = "select user.username from user_profiles user inner join post_people_tags on post_people_tags.user_id = user.user_id where post_people_tags.post_id = ?"

        let [result] = await connection.query(postDetailsQuery, id);
        const [hashtagRes] = await connection.query(hashtagQuery, id);
        const [tagPeopleRes] = await connection.query(tagPeopleQuery, id);
        result = Object.values(
          result.reduce(
            (
              acc,
              {
                username,
                location,
                like_count,
                comment_count,
                descriptions,
                image,
                profile_image,
                ismultiple,
                isvideo
              }
            ) => {
              acc[username] ??= {
                username,
                location,
                like_count,
                comment_count,
                descriptions,
                image: [],
                profile_image,
                ismultiple,
                isvideo: []
              };
  
              acc[username].image.push(image);
              acc[username].isvideo.push(isvideo);
              return acc;
            },
            {}
          )
        );
        res.status(200).json({ postData: result, hashTags: hashtagRes, tagPeoples: tagPeopleRes });
      } catch (error) {
        console.log(error);
        logger.error("Post Details Controller getDetail function" + error)

      }
    },
  };
};

module.exports = onePostDetails;
