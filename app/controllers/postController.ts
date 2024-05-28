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
import { UpdateSet, dataSet, insertSet } from "../../dto/commonInterface";
import { Strategy } from "passport";

const postController = () => {
  return {
    async getUsersUserName(req: Request, res: Response) {
      try {
        let userNames: string[] = [];
        let profileImages: string[] = [];
        let result: dataSet = await conn.query(
          `select userName,profile_image from user_profiles where userName like ?  and NOT user_id = ?`,
          [`${req.body.userLike}%`, (req.user as UserId).userId]
        );
        const postImagesDetails: getUsersUserNameInterface[] =
          result[0] as getUsersUserNameInterface[];

        postImagesDetails.forEach((item: getUsersUserNameInterface): void => {
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
        let hashtagNames: string[] = [];
        let result: dataSet = await conn.query(
          `select name from hashtags where name like ?`,
          [`#${req.body.hashtagLike}%`]
        );

        const hashtagDetails: getHashTagInterface[] =
          result[0] as getHashTagInterface[];

        hashtagDetails.forEach((item: getHashTagInterface): void => {
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
        let result: insertSet = await conn.query<ResultSetHeader>(
          "INSERT INTO posts SET ?",
          postDetail
        );
        const postId: number = result[0].insertId;

        //post image insert
        const extention: string[] = ["webm", "mp4"];
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
              let hashtagId: dataSet = await conn.query(
                `SELECT id FROM hashtags WHERE name = ?`,
                [item]
              );

              const hashtagIdDetails: idForuser[] = hashtagId[0] as idForuser[];

              if (hashtagIdDetails.length == 1) {
                let result = await conn.query(
                  `INSERT INTO post_hashtags (post_id, tag)
                VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                  [postId, hashtagIdDetails[0].id]
                );
              } else {
                let newHashtag: { name: string } = {
                  name: item,
                };
                let result: insertSet = await conn.query<ResultSetHeader>(
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
              let userId: dataSet = await conn.query<QueryResult>(
                `SELECT user_id FROM user_profiles  WHERE userName = ?`,
                [item]
              );

              const userIdDetails: useridForuser[] =
                userId[0] as useridForuser[];

              if (userIdDetails.length == 1) {
                let result = await conn.query(
                  `INSERT INTO post_people_tags (post_id,user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                  [postId, userIdDetails[0].user_id]
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
        const postId: string = req.body.postId;
        if (!/^\d+$/.test(postId)) {
          return res.status(500).json({ error: true });
        }
        let result: dataSet = await conn.query(
          `SELECT EXISTS(SELECT * FROM posts WHERE id = ? and user_id = ?) as isexists`,
          [postId, (req.user as UserId).userId]
        );

        const existDetails: deletePost[] = result[0] as deletePost[];

        // deletePost
        if (existDetails[0].isexists) {
          const result1: UpdateSet = await conn.query<ResultSetHeader>(
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
        let postDetail: dataSet = await conn.query(
          "select location,caption,descriptions,privacy_id from posts where id = ?",
          [req.query.id]
        );
        let hashtags: dataSet = await conn.query(
          `select name from hashtags where id in(select tag from post_hashtags where post_id = ? and isdeleted is null)`,
          [req.query.id]
        );
        let peopleTags: dataSet = await conn.query(
          `select username from user_profiles where id in(select user_id from post_people_tags where post_id = ? and isdeleted is null);`,
          [req.query.id]
        );

        let postImages: dataSet = await conn.query(
          "select image,isvideo from post_images where post_id = ?",
          [req.query.id]
        );

        const privacy: dataSet = await conn.query("select * from privacy");

        return res.render("components/create/posts/updatePost", {
          postDetail: postDetail[0],
          hashtags: hashtags[0],
          peopleTags: peopleTags[0],
          postId: req.query.id,
          postImages: postImages[0],
          privacy: privacy[0],
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
        let result: UpdateSet = await conn.query(
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
            let hashtagId: dataSet = await conn.query(
              `SELECT id FROM hashtags WHERE name = ?`,
              [item]
            );

            const hashtagDetails: HashTagName[] = hashtagId[0] as HashTagName[];

            // HashTagName
            if (hashtagDetails.length == 1) {
              result = await conn.query(
                `INSERT INTO post_hashtags (post_id, tag)
                VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                [req.query.id, hashtagDetails[0].id]
              );
            } else {
              let newHashtag: { name: string } = {
                name: item,
              };
              let result: insertSet = await conn.query<ResultSetHeader>(
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
            let userId:dataSet = (await conn.query(
              `SELECT user_id FROM user_profiles  WHERE userName = ?`,
              [item]
            )) ;

            const useridDetails: UserProfileList[] = userId[0] as UserProfileList[];

            // UserProfileList
            if (useridDetails.length == 1) {
              let result = await conn.query(
                `INSERT INTO post_people_tags (post_id,user_id) VALUES (?,?) ON DUPLICATE KEY UPDATE isdeleted = null`,
                [req.query.id, useridDetails[0].user_id]
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
        const result:dataSet = await conn.query(privacyQuery);
        res.render("components/create/posts/createPost", { privacy: result[0] });
      } catch (error) {
        logger.error("post controller get post Insert form: " + error);
      }
    },
  };
};

export default postController;
