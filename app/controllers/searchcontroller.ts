import { Request, Response } from "express";
import connection from "../config/mysql_connection";
import logger from "../config/logger";
import homefunc from "./homeControllers/homeController";
import { UserId } from "../../index";
import {
  uniqueUsername,
  uniqueCount,
  uniqueLocation,
  uniqueHashtag,
  uniquePost,
  manyPosts,
} from "../../dto/searchControllerInterface";
import { QueryResult } from "mysql2";
import { UnknownFieldInstance } from "express-validator/src/base";
import { QueryError } from "sequelize";
import { accumalator } from "../../dto/notificationControllerInterface";
interface Post {
  id?: number;
  user_id?: number;
  image?: string | null;
  isvideo?: boolean | null;
  userId?: number;
  username?: string;
  ismultiple?: number;
  location?: string;
  profile_image?: string;
  privacy?: string;
  like_count?: number;
  comment_count?: number;
  caption?: string;
  create_at?: string;
  flag?: string;
  save_posts?: string;
}

interface profilePost {
  user_id?: number;
  id: number;
  ismultiple?: number;
  image: Array<string>;
  isvideo: Array<number>;
}

interface query3Interface {
  id?: string;
  user_id: number;
  post_id: string;
  users: number;
  ismultiple?: number;
  image: Array<string> | string;
  isvideo: Array<number> | number;
  profileId?: number ;
}

interface query3Result{
  id: string;
  user_id: number;
  image: Array<string> | string;
  isvideo: Array<number> | number;
  profileId?: number ;
}

interface postAcc {
  [x: string]: query3Result;
}

interface profileAcc {
  [x: string]: profilePost;
}

interface SearchResult {
  username: string;
}

interface LocationResult {
  user_id: number;
  post_id: number;
  image: string | null;
  isvideo: boolean | null;
}

interface TagResult {
  post_id: number;
  user_id: number;
  image: string | null;
  isvideo: boolean | null;
}

const searchcontroller = () => {
  return {
    async getpage(req: Request, res: Response) {
      try {
        const result = await connection.query(`SELECT p.id, p.user_id,
          (SELECT pi.image FROM post_images pi WHERE pi.post_id = p.id ORDER BY pi.id LIMIT 1) 
          AS image, (SELECT isvideo FROM post_images pi WHERE pi.post_id = p.id LIMIT 1) AS isvideo
          FROM posts p
          WHERE p.isdeleted IS NULL AND p.privacy_id = 1  
          ORDER BY p.update_at DESC
          LIMIT 100;`);
        res.render("components/search/search", { result: result[0] });
      } catch (error) {
        logger.error("search Controller getPage function: ", error);
      }
    },
    async getUsersUserName(req: Request, res: Response) {
      try {
        const usernames: string[] = [];
        const result: Array<uniqueUsername> =
          (await connection.query<QueryResult>(
            `SELECT DISTINCT(username) FROM user_profiles WHERE username LIKE CONCAT(?, "%")`,
            [req.body.userLike]
          )) as unknown as Array<uniqueUsername>;
        result.forEach((item: SearchResult) => {
          usernames.push(item.username);
        });
        return res.json(usernames);
      } catch (error) {
        logger.error("search Controller getUsersUserName function: ", error);
      }
    },
    async getHashTags(req: Request, res: Response) {
      try {
        const hashtagNames: string[] = [];
        const result: Array<uniqueHashtag> =
          (await connection.query<QueryResult>(
            `SELECT DISTINCT(name) FROM hashtags WHERE name LIKE CONCAT(?, "%")`,
            [req.body.hashtagLike]
          )) as unknown as Array<uniqueHashtag>;

        result.forEach((item: { name: string }) => {
          hashtagNames.push(item.name);
        });
        return res.json(hashtagNames);
      } catch (error) {
        logger.error("search Controller getHashTags function: ", error);
      }
    },
    async getLocation(req: Request, res: Response) {
      try {
        const locationNames: string[] = [];
        const result2: Array<uniqueLocation> =
          (await connection.query<QueryResult>(
            `SELECT DISTINCT(location) FROM posts WHERE location LIKE CONCAT(?, "%")`,
            [req.body.locationLike]
          )) as unknown as Array<uniqueLocation>;

        result2.forEach((item: { location: string }) => {
          locationNames.push(item.location);
        });
        return res.json(locationNames);
      } catch (error) {
        logger.error("search Controller getLocation function: ", error);
      }
    },
    async onepost(req: Request, res: Response) {
      const post_id = req.query.post_id;
      const user_id2 = req.query.user_id;

      const count_q: Array<uniqueCount> = (await connection.query<QueryResult>(
        `SELECT COUNT(*) AS counter FROM posts WHERE id = ? AND user_id = ? ;`,
        [post_id, user_id2]
      )) as unknown as Array<uniqueCount>;

      if (count_q[0].counter == 1) {
        try {
          const result: Array<Post> = (await homefunc().getHome(
            req
          )) as unknown as Array<Post>;

          let tempobj: Post = {};
          result.forEach((e: Post, i: number) => {
            if (e.id == post_id) {
              tempobj = e;
              result.splice(i, 1);
            }
          });
          result.push(tempobj);
          res.render("components/home/homeMain", {
            showPosts: result,
          });
        } catch (error) {
          logger.error("search Controller onepost function: ", error);
        }
      } else {
        res.redirect("/search");
      }
    },
    async getprofilepage(req: Request, res: Response) {
      const user_id = req.query.userid;
      const userId = (req.user as UserId).userId;

      if (user_id == userId) {
        res.redirect("/userProfile");
        return;
      }

      const count_q: Array<uniqueCount> = (await connection.query<QueryResult>(
        `SELECT COUNT(*) AS counter FROM user_profiles WHERE user_id = ? ;`,
        [user_id]
      )) as unknown as Array<uniqueCount>;

      if (count_q[0].counter == 1) {
        try {
          const query = `SELECT * FROM user_profiles WHERE user_id = ? ;`;

          const result = await connection.query(query, user_id);

          const query_2 = `SELECT user_id, posts.id, posts.ismultiple, post_images.image, post_images.isvideo
                         FROM posts, post_images
                         WHERE posts.user_id = ? AND posts.id = post_images.post_id 
                         AND posts.isdeleted IS NULL AND posts.privacy_id = 1;`;

          const result2: Array<profilePost> =
            (await connection.query<QueryResult>(
              query_2,
              user_id
            )) as unknown as Array<profilePost>;
          const multiplePost = result2.reduce(
            (accumulator: profileAcc, item: profilePost) => {
              accumulator[item.id] = {
                id: item.id,
                user_id: item.user_id,
                image: item.image, /////////doubt
                isvideo: item.isvideo, /////////doubt
              };

              // accumulator[item.id].image.push(item.image);
              // accumulator[item.id].isvideo.push(item.isvideo);
              return accumulator;
            },
            {}
          );

          const query_3 = `SELECT post_people_tags.user_id, post_people_tags.post_id, posts.user_id AS users,
                            post_images.image, post_images.isvideo, posts.ismultiple
                            FROM post_images INNER JOIN post_people_tags ON post_people_tags.post_id = post_images.post_id
                            INNER JOIN posts ON posts.id = post_images.post_id
                            WHERE post_people_tags.user_id= ? AND posts.isdeleted IS NULL
                            ORDER BY posts.create_at DESC;`;

          const result3: Array<query3Interface> =
            (await connection.query<QueryResult>(
              query_3,
              user_id
            )) as unknown as Array<query3Interface>;
          const multiTagePosts = result3.reduce(
            (accumulator: postAcc, item: query3Interface) => {
              accumulator[item.post_id] ??= {
                id: item.post_id,
                user_id: item.users,
                image: item.image,
                profileId: Number(user_id),
                isvideo: item.isvideo,
              };

              // accumulator[item.post_id].image.push(item.image);
              // accumulator[item.post_id].isvideo.push(item.isvideo);
              return accumulator;
            },
            {}
          );

          res.render("components/search/seeprofile", {
            result: result[0],
            result2: multiplePost,
            result3: multiTagePosts,
          });
        } catch (error) {
          logger.error("search Controller getprofilepage function: ", error);
        }
      } else {
        res.redirect("/search");
      }
    },
    async postsearchpage(req: Request, res: Response) {
      let search = req.body.search.trim();
      search = search.replaceAll("'", "");
      try {
        if (search) {
          const searchhistory = `INSERT INTO search_history(user_id, search) VALUES (?, ?);`;

          const history = await connection.query(searchhistory, [
            (req.user as UserId).userId,
            search,
          ]);

          const accounts = `SELECT user_id, username FROM user_profiles WHERE username LIKE CONCAT("%", ?, "%");`;

          const result3 = await connection.query(accounts, search);

          const query_search = `SELECT user_id, posts.id AS post_id, 
      (SELECT pi.image FROM post_images pi WHERE pi.post_id = posts.id ORDER BY pi.id LIMIT 1) AS image,
      (SELECT isvideo FROM post_images pi WHERE pi.post_id = posts.id LIMIT 1) AS isvideo 
      FROM posts 
      WHERE posts.privacy_id = 1 AND posts.isdeleted IS NULL AND location LIKE CONCAT("%", ?, "%");`;

          const result2 = await connection.query(query_search, search);

          const tags = `SELECT DISTINCT(post_id) FROM post_hashtags 
      INNER JOIN hashtags ON post_hashtags.tag = hashtags.id WHERE name LIKE CONCAT("%", ?, "%");`;

          const result4: Array<uniquePost> =
            (await connection.query<QueryResult>(
              tags,
              search
            )) as unknown as Array<uniquePost>;

          let result;

          if (result4.length != 0) {
            let str = `SELECT DISTINCT(post_id), user_id, image, post_images.isvideo 
        FROM posts INNER JOIN post_images ON post_images.post_id = posts.id 
        WHERE posts.privacy_id = 1 AND posts.isdeleted IS NULL AND post_id IN (`;

            for (let i = 0; i < result4.length; i++) {
              str += result4[i].post_id + ",";
            }
            str = str.slice(0, str.length - 1) + ")";

            result = await connection.query<QueryResult>(str);
          }
          res.render("components/search/aftersearch", {
            search,
            result: result,
            result2: result2[0],
            result3: result3[0],
          });
        } else {
          res.redirect("/search");
        }
      } catch (error) {
        logger.error("search Controller postsearchpage function: ", error);
      }
    },
  };
};

module.exports = searchcontroller;
