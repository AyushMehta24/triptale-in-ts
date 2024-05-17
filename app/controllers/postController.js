const conn = require("../config/mysql_connection");
const logger = require("../config/logger");
const postController = () => {
  return {
    async getUsersUserName(req, res) {
      try {
        let userNames = [];
        let profileImages = [];
        let result = await conn.query(
          `select userName,profile_image from user_profiles where userName like ?  and NOT user_id = ?`,
          [`${req.body.userLike}%`, req.user.userId]
        );
        result[0].forEach((item) => {
          userNames.push(item.userName);
          profileImages.push(item.profile_image);
        });
        return res.json({ userNames, profileImages });
      } catch (error) {
        logger.error("Post Controller getUsersUserName: " + error);
        return res.json({ error: error });
      }
    },
    async getHashTags(req, res) {
      try {
        let hashtagNames = [];
        let result = await conn.query(
          `select name from hashtags where name like ?`,
          [`#${req.body.hashtagLike}%`]
        );

        result[0].forEach((item) => {
          hashtagNames.push(item.name);
        });
        return res.json(hashtagNames);
      } catch (error) {
        logger.error("Post Controller getHashTags:" + error);
        return res.json({ error: error });
      }
    },
    async insertPost(req, res) {
      try {
        await conn.beginTransaction();
        //post detail insert
        let postDetail = {
          user_id: req.user.userId,
          location: req.body.location.trim().slice(0, 30),
          privacy_id: req.body.privacy,
          ismultiple: req.files.length > 1 ? 1 : 0,
        };
        if (
          req.body.caption.trim().length >= 1 &&
          req.body.caption.trim().length < 50
        ) {
          postDetail["caption"] = req.body.caption.trim();
        }
        if (
          req.body.description.trim().length >= 1 &&
          req.body.description.trim().length < 350
        ) {
          postDetail["descriptions"] = req.body.description.trim();
        }
        let result = await conn.query("INSERT INTO posts SET ?", postDetail);
        const postId = result[0].insertId;

        //post image insert
        const extention = process.env.VIDEO_EXTENSION;
        try {
          req.files.forEach(async (item) => {
            let image = {
              post_id: postId,
              image: item.path.split("/").splice(2).join("/"),
              isvideo: extention.includes(item.path.split(".").pop()) ? 1 : 0,
            };
            result = await conn.query("INSERT INTO post_images SET ?", image);
          });
        } catch (error) {
          logger.error(error);
        }
        
        //post hashtag insert
        if (req.body.hashtags) {
          req.body.hashtags.forEach(async (item) => {
            try {
              let hashtagId = await conn.query(
                `SELECT id FROM hashtags WHERE name = ?`,
                [item]
              );
              if (hashtagId[0].length == 1) {
                let result = await conn.query(
                  `INSERT INTO post_hashtags (post_id, tag)
                VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                  [postId, hashtagId[0][0].id]
                );
              } else {
                let newHashtag = {
                  name: item,
                };
                let result = await conn.query(
                  "INSERT INTO hashtags SET ?",
                  newHashtag
                );
                result = await conn.query(
                  `INSERT INTO post_hashtags (post_id, tag)
                VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                  [postId, result[0].insertId]
                );
              }
            } catch (error) {
              logger.error("insert post", error);
            }
          });
        }

        // post people tag insert
        if (req.body.peopleTag) {
          req.body.peopleTag.forEach(async (item) => {
            try {
              let userId = await conn.query(
                `SELECT user_id FROM user_profiles  WHERE userName = ?`,
                [item]
              );
              if (userId[0].length == 1) {
                let result = await conn.query(
                  `INSERT INTO post_people_tags (post_id,user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                  [postId, userId[0][0].user_id]
                );
              }
            } catch (error) {
              logger.error(error);
            }
          });
        }
        await conn.commit();
        return res.redirect("/home");
      } catch (error) {
        logger.error("Post Controller insertPost: " + error);
        await conn.rollback();
        return res.redirect("/error");
      }
    },
    async deletePost(req, res) {
      try {
        const postId = req.body.postId;
        if (!/^\d+$/.test(postId)) {
          return res.status(500).json({ error: true });
        }
        let result = await conn.query(
          `SELECT EXISTS(SELECT * FROM posts WHERE id = ? and user_id = ?) as isexists`,
          [postId, req.user.userId]
        );
        if (result[0][0].isexists) {
          result = await conn.query(
            `update posts set isdeleted = CURRENT_TIMESTAMP where id = ?`,
            [postId]
          );
          if (result[0].affectedRows == 1) {
            return res.status(200).json({ error: false });
          }
        } else {
          return res.status(500).json({ error: true });
        }
      } catch (error) {
        logger.error("Post Controller deletePost: " + error);
        return res.status(500).json({ error: true });
      }
    },
    async updatePostForm(req, res) {
      try {
        let postDetail = await conn.query(
          "select location,caption,descriptions,privacy_id from posts where id = ?",
          [req.query.id]
        );
        let hashtags = await conn.query(
          `select name from hashtags where id in(select tag from post_hashtags where post_id = ? and isdeleted is null)`,
          [req.query.id]
        );
        let peopleTags = await conn.query(
          `select username from user_profiles where id in(select user_id from post_people_tags where post_id = ? and isdeleted is null);`,
          [req.query.id]
        );

        let postImages = await conn.query(
          "select image,isvideo from post_images where post_id = ?",
          [req.query.id]
        );

        const [privacy] = await conn.query("select * from privacy");

        return res.render("components/create/posts/updatePost", {
          postDetail: postDetail[0][0],
          hashtags: hashtags[0],
          peopleTags: peopleTags[0],
          postId: req.query.id,
          postImages: postImages[0],
          privacy: privacy,
        });
      } catch (error) {
        logger.error("Post Controller updatePostForm: " + error);
        return res.redirect("/userProfile");
      }
    },
    async updatePost(req, res) {
      try {
        await conn.beginTransaction();
        let postDetail = {
          location: req.body.location.trim().slice(0, 30),
          privacy_id: req.body.privacy,
        };
        if (
          req.body.caption.trim().length >= 1 &&
          req.body.caption.trim().length < 50
        ) {
          postDetail["caption"] = req.body.caption.trim();
        }
        if (
          req.body.description.trim().length >= 1 &&
          req.body.description.trim().length < 350
        ) {
          postDetail["descriptions"] = req.body.description.trim();
        }
        let result = await conn.query(
          `UPDATE  posts SET ? where id = ${req.query.id}`,
          postDetail
        );
        // hashtags update
        result = await conn.query(
          `update  post_hashtags set isdeleted = CURRENT_TIMESTAMP where post_id = ?`,
          [req.query.id]
        );
        if (req.body.hashtags) {
          req.body.hashtags.forEach(async (item) => {
            let hashtagId = await conn.query(
              `SELECT id FROM hashtags WHERE name = ?`,
              [item]
            );
            if (hashtagId[0].length == 1) {
              result = await conn.query(
                `INSERT INTO post_hashtags (post_id, tag)
                VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                [req.query.id, hashtagId[0][0].id]
              );
            } else {
              let newHashtag = {
                name: item,
              };
              let result = await conn.query(
                "INSERT INTO hashtags SET ?",
                newHashtag
              );
              let postHashtag = {
                post_id: req.query.id,
                tag: result[0].insertId,
              };
              result = await conn.query(
                `INSERT INTO post_hashtags SET ?`,
                postHashtag
              );
            }
          });
        }

        //tag people update
        result = await conn.query(
          `update  post_people_tags set isdeleted = CURRENT_TIMESTAMP where post_id = ?`,
          [req.query.id]
        );
        if (req.body.peopleTag) {
          req.body.peopleTag.forEach(async (item) => {
            let userId = await conn.query(
              `SELECT user_id FROM user_profiles  WHERE userName = ?`,
              [item]
            );
            if (userId[0].length == 1) {
              let result = await conn.query(
                `INSERT INTO post_people_tags (post_id,user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                [req.query.id, userId[0][0].user_id]
              );
            }
          });
        }
        await conn.commit();
        return res.redirect("/userProfile");
      } catch (error) {
        logger.error("Post Controller updatePost" + error);
        await conn.rollback();
        return res.redirect("/error");
      }
    },
    async getPostInsertForm(req, res) {
      try {
        const privacyQuery = "select * from privacy";
        const [result] = await conn.query(privacyQuery);
        res.render("components/create/posts/createPost", { privacy: result });
      } catch (error) {
        logger.error("post controller get post Insert form: " + error);
      }
    },
  };
};

module.exports = postController;
