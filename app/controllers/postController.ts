import conn from "../config/mysql_connection";
import logger from "../config/logger";
import { Request, Response } from "express";
import { UserId } from "../../index";
import { ProfileImage } from "../../index";
import {
  getUsersUserNameInterface,
  postDetailInterface,
  getHashTagInterface,
  insertPostImage,
  idForuser,
  useridForuser,
  deletePost,
  updatePostForm,
  updatePostInterface,
  HashTagName,
  UserProfileList,
} from "../../dto/postControllerInterface";
import { QueryResult, ResultSetHeader } from "mysql2";

const postController = () => {
  return {
    async getUsersUserName(req: Request, res: Response) {
      try {
        let userNames: Array<string> = [];
        let profileImages: Array<string> = [];
        let result: Array<getUsersUserNameInterface> = (await conn.query(
          `select userName,profile_image from user_profiles where userName like ?  and NOT user_id = ?`,
          [`${req.body.userLike}%`, (req.user as UserId).userId]
        )) as unknown as Array<getUsersUserNameInterface>;
        result.forEach((item: getUsersUserNameInterface): void => {
          userNames.push(item.userName);
          profileImages.push(item.profile_image);
        });
        return res.json({ userNames, profileImages });
      } catch (error) {
        logger.error("Post Controller getUsersUserName: " + error);
        return res.json({ error: error });
      }
    },
    async getHashTags(req: Request, res: Response) {
      try {
        let hashtagNames: Array<string> = [];
        let result: Array<getHashTagInterface> = (await conn.query<QueryResult>(
          `select name from hashtags where name like ?`,
          [`#${req.body.hashtagLike}%`]
        )) as unknown as Array<getHashTagInterface>;

        result.forEach((item: getHashTagInterface): void => {
          hashtagNames.push(item.name);
        });
        return res.json(hashtagNames);
      } catch (error) {
        logger.error("Post Controller getHashTags:" + error);
        return res.json({ error: error });
      }
    },
    async insertPost(req: Request, res: Response) {
      try {
        await conn.beginTransaction();

        if (!req.files) {
          throw new Error("No image uploaded");
        }
        //post detail insert
        let postDetail: postDetailInterface = {
          user_id: (req.user as UserId).userId,
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
        let result = await conn.query<ResultSetHeader>(
          "INSERT INTO posts SET ?",
          postDetail
        );
        const postId = result[0].insertId;

        //post image insert
        const extention: Array<string> = ["webm", "mp4"];
        try {
          req.files.forEach(async (item: ProfileImage) => {
            let image: insertPostImage = {
              post_id: postId,
              image: item.path.split("/").splice(2).join("/"),
              isvideo: extention.includes(item.path.split(".").pop() || "")
                ? 1
                : 0,
            };
            result = await conn.query("INSERT INTO post_images SET ?", image);
          });
        } catch (error) {
          logger.error(error);
        }

        //post hashtag insert
        if (req.body.hashtags) {
          req.body.hashtags.forEach(async (item: string) => {
            try {
              let hashtagId: Array<idForuser> = (await conn.query<QueryResult>(
                `SELECT id FROM hashtags WHERE name = ?`,
                [item]
              )) as unknown as Array<idForuser>;
              if (hashtagId.length == 1) {
                let result = await conn.query(
                  `INSERT INTO post_hashtags (post_id, tag)
                VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                  [postId, hashtagId[0].id]
                );
              } else {
                let newHashtag: { name: string } = {
                  name: item,
                };
                let result = await conn.query<ResultSetHeader>(
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
          req.body.peopleTag.forEach(async (item: string) => {
            try {
              let userId: Array<useridForuser> = (await conn.query<QueryResult>(
                `SELECT user_id FROM user_profiles  WHERE userName = ?`,
                [item]
              )) as unknown as Array<useridForuser>;
              if (userId.length == 1) {
                let result = await conn.query(
                  `INSERT INTO post_people_tags (post_id,user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                  [postId, userId[0].user_id]
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
    async deletePost(req: Request, res: Response) {
      try {
        const postId = req.body.postId;
        if (!/^\d+$/.test(postId)) {
          return res.status(500).json({ error: true });
        }
        let result: Array<deletePost> = (await conn.query(
          `SELECT EXISTS(SELECT * FROM posts WHERE id = ? and user_id = ?) as isexists`,
          [postId, (req.user as UserId).userId]
        )) as unknown as Array<deletePost>;
        if (result[0].isexists) {
          const result1 = await conn.query<ResultSetHeader>(
            `update posts set isdeleted = CURRENT_TIMESTAMP where id = ?`,
            [postId]
          );
          if (result1[0].affectedRows == 1) {
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
    async updatePostForm(req: Request, res: Response) {
      try {
        let postDetail: Array<updatePostForm> = (await conn.query<QueryResult>(
          "select location,caption,descriptions,privacy_id from posts where id = ?",
          [req.query.id]
        )) as unknown as Array<updatePostForm>;
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
          postDetail: postDetail[0],
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
    async updatePost(req: Request, res: Response) {
      try {
        await conn.beginTransaction();
        let postDetail: updatePostInterface = {
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
          req.body.hashtags.forEach(async (item: string) => {
            let hashtagId: Array<HashTagName> = (await conn.query<QueryResult>(
              `SELECT id FROM hashtags WHERE name = ?`,
              [item]
            )) as unknown as Array<HashTagName>;
            if (hashtagId.length == 1) {
              result = await conn.query(
                `INSERT INTO post_hashtags (post_id, tag)
                VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                [req.query.id, hashtagId[0].id]
              );
            } else {
              let newHashtag = {
                name: item,
              };
              let result = await conn.query<ResultSetHeader>(
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
          req.body.peopleTag.forEach(async (item: string) => {
            let userId: Array<UserProfileList> = (await conn.query<QueryResult>(
              `SELECT user_id FROM user_profiles  WHERE userName = ?`,
              [item]
            )) as unknown as Array<UserProfileList>;
            if (userId.length == 1) {
              let result = await conn.query(
                `INSERT INTO post_people_tags (post_id,user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                [req.query.id, userId[0].user_id]
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
    async getPostInsertForm(req: Request, res: Response) {
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

export default postController;
