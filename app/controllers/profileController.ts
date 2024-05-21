import { Request, Response } from "express";
import conn from "../config/mysql_connection";
import logger from "../config/logger";

interface UserProfileController {
  getUserProfilePage(req: Request, res: Response): void;
  getEditProfilePage(req: Request, res: Response): void;
  fetchAlubums(req: Request, res: Response): Promise<void>;
  createAlbums(req: Request, res: Response): Promise<void>;
  fetchPosts(req: Request, res: Response): Promise<void>;
  fetchPopupPosts(req: Request, res: Response): Promise<void>;
  fetchTagePost(req: Request, res: Response): Promise<void>;
  fetchOneAlbumsPost(req: Request, res: Response): Promise<void>;
  deletePostIdFromalbum(req: Request, res: Response): Promise<void>;
  otherPostShowInAlbums(req: Request, res: Response): Promise<void>;
  addPostInAlbums(req: Request, res: Response): Promise<void>;
  fetchDetails(req: Request, res: Response): Promise<void>;
  deleteAlbum(req: Request, res: Response): Promise<void>;
  updateAlbumName(req: Request, res: Response): Promise<void>;
  deletePostInAlbumFromHome(req: Request, res: Response): Promise<void>;
  onepost(req: Request, res: Response): Promise<void>;
}
import { UserId } from "../../index";
import {
  multiplePostItem,
  multiplePostAcc,
  FetchPostInterface,
  FetchPostInterfaceAcc,
  fetchPopupPostsInterface,
  fetchPopupPostsInterfaceAcc,
  fetchTagePostInterface,
  fetchTagePostInterfaceAcc,
  fetchOneAlbumsPostInterface,
  fetchOneAlbumsPostInterfaceAcc,
  otherPostShowInAlbumsInterface,
  otherPostShowInAlbumsInterfaceAcc,
  onepostInterface,
  onepostInterfaceAcc,
} from "../../dto/profileControllerInterface";
import { QueryResult } from "mysql2";

const profileController: UserProfileController = {
  getUserProfilePage(req, res) {
    res.render("components/profile/userProfilePage");
  },
  getEditProfilePage(req, res) {
    res.render("components/profile/userProfilePage");
  },
  async fetchAlubums(req, res) {
    try {
      const userId = (req.user as UserId).userId;
      const sql = `SELECT * FROM albums WHERE user_id = ?`;
      const sql1 = `SELECT albums.id, albums.albums_name, albums.user_id, albums_post.post_id, post_images.image, posts.isdeleted, post_images.isvideo
                FROM albums
                LEFT JOIN albums_post ON albums.id = albums_post.album_id
                LEFT JOIN post_images ON post_images.post_id = albums_post.post_id
                LEFT JOIN posts ON posts.id = post_images.post_id
                WHERE albums.user_id = ?`;

      let [albums] = await conn.query(sql, [userId]);
      const albumsCoverImage: Array<multiplePostItem> =
        (await conn.query<QueryResult>(sql1, [
          userId,
        ])) as unknown as Array<multiplePostItem>;

      const multiplePost = albumsCoverImage.reduce(
        (accumulator: multiplePostAcc, item: multiplePostItem) => {
          accumulator[item.id] ??= {
            id: item.id,
            user_id: item.user_id,
            albums_name: item.albums_name,
            post_id: [],
            isdeleted: item.isdeleted,
            isvideo: [],
          };
          if (item.isdeleted == null) {
            accumulator[item.id].post_id.push(item.post_id);
            accumulator[item.id].isvideo.push(item.isvideo);
          }
          return accumulator;
        },
        {}
      );

      res.json({ albums, albumsCoverImage: multiplePost });
    } catch (e) {
      logger.error("profileController fetchAlubums: ", e);
      res.status(500).send(e);
    }
  },
  async createAlbums(req, res) {
    try {
      const alubamName = req.body.albumName.trim();
      const userId = (req.user as UserId).userId;
      if (alubamName.length != 0) {
        const sql = `INSERT INTO albums (user_id, albums_name) VALUES (?, ?)`;
        await conn.query(sql, [userId, alubamName]);
        res.status(200).end();
      } else {
        res.status(500).end();
      }
    } catch (e) {
      logger.error("profileController createAlbum: ", e);
      res.status(500).send(e);
    }
  },
  async fetchPosts(req, res) {
    try {
      const userId = (req.user as UserId).userId;
      const sql = `SELECT user_profiles.user_id, user_profiles.first_name, user_profiles.last_name, user_profiles.username, user_profiles.profile_image,
                posts.id, posts.location, posts.like_count, posts.comment_count, posts.ismultiple, posts.caption, posts.descriptions, post_images.image, post_images.isvideo
                FROM posts
                LEFT JOIN user_profiles ON user_profiles.user_id = posts.user_id
                LEFT JOIN post_images ON posts.id = post_images.post_id
                WHERE user_profiles.user_id = ? AND posts.isdeleted IS NULL
                ORDER BY posts.create_at DESC`;
      const posts: Array<FetchPostInterface> = (await conn.query<QueryResult>(
        sql,
        [userId]
      )) as unknown as Array<FetchPostInterface>;

      const multiplePost = posts.reduce(
        (accumulator: FetchPostInterfaceAcc, item: FetchPostInterface) => {
          accumulator[item.id] ??= {
            id: item.id,
            user_id: item.user_id,
            image: [],
            isvideo: [],
          };

          accumulator[item.id].image.push(item.image);
          accumulator[item.id].isvideo.push(item.isvideo);
          return accumulator;
        },
        {}
      );

      res.json({ posts, multiplePost });
      res.status(200);
    } catch (e) {
      logger.error("profileController fetchPosts: ", e);
      res.status(500).send(e);
    }
  },
  async fetchPopupPosts(req, res) {
    try {
      const user = req.query.user;
      const post = req.query.post;

      const sql = `SELECT user_profiles.user_id, user_profiles.first_name, user_profiles.last_name, user_profiles.username, user_profiles.profile_image,
                posts.id, posts.location, posts.like_count, posts.comment_count, posts.ismultiple, posts.caption, posts.descriptions, post_images.image
                FROM posts
                LEFT JOIN user_profiles ON user_profiles.user_id = posts.user_id
                LEFT JOIN post_images ON posts.id = post_images.post_id
                WHERE user_profiles.user_id = ? AND posts.id = ?`;

      const popupPost: Array<fetchPopupPostsInterface> =
        (await conn.query<QueryResult>(sql, [
          user,
          post,
        ])) as unknown as Array<fetchPopupPostsInterface>;

      const multiplePost = popupPost.reduce(
        (
          accumulator: fetchPopupPostsInterfaceAcc,
          item: fetchPopupPostsInterface
        ) => {
          accumulator[item.id] ??= {
            id: item.id,
            user_id: item.user_id,
            image: [],
            ismultiple: item.ismultiple,
            username: item.username,
            location: item.location,
            like_count: item.like_count,
            profile_image: item.profile_image,
            comment_count: item.comment_count,
            caption: item.caption,
          };

          accumulator[item.id].image.push(item.image);
          return accumulator;
        },
        {}
      );

      res.render("/components/profile/homeMain.ejs", {
        showPosts: multiplePost,
      });
      res.status(200).json(multiplePost);
    } catch (e) {
      logger.error("profileController fetchPopupPosts: ", e);
      res.status(500).send(e);
    }
  },
  async fetchTagePost(req, res) {
    try {
      const userId = (req.user as UserId).userId;

      const sql = `SELECT post_people_tags.user_id, post_people_tags.post_id, posts.user_id AS users, posts.location, posts.like_count, posts.isdeleted, posts.comment_count, posts.ismultiple, posts.caption, posts.descriptions, post_images.image, post_images.isvideo, user_profiles.first_name, user_profiles.last_name, user_profiles.username, user_profiles.profile_image
                FROM posts
                LEFT JOIN post_people_tags ON post_people_tags.post_id = posts.id
                LEFT JOIN post_images ON posts.id = post_images.post_id
                LEFT JOIN user_profiles ON user_profiles.user_id = posts.user_id
                WHERE post_people_tags.user_id = ? AND posts.isdeleted IS NULL`;

      const posts: Array<fetchTagePostInterface> =
        (await conn.query<QueryResult>(sql, [
          userId,
        ])) as unknown as Array<fetchTagePostInterface>;
      const multiTagePosts = posts.reduce(
        (
          accumulator: fetchTagePostInterfaceAcc,
          item: fetchTagePostInterface
        ) => {
          accumulator[item.post_id] ??= {
            id: item.post_id,
            user_id: item.users,
            image: [],
            profileId: userId,
            isvideo: [],
          };

          accumulator[item.post_id].image.push(item.image);
          accumulator[item.post_id].isvideo.push(item.isvideo);
          return accumulator;
        },
        {}
      );

      res.status(200).json(multiTagePosts);
    } catch (e) {
      logger.error("profileController fetchTagePost: ", e);
      res.status(500).send(e);
    }
  },
  async fetchOneAlbumsPost(req, res) {
    try {
      const sql = `SELECT albums.id, albums.user_id, albums.albums_name, albums_post.post_id, post_images.image, post_images.isvideo, posts.isdeleted
                FROM albums
                LEFT JOIN albums_post ON albums_post.album_id = albums.id
                LEFT JOIN post_images ON post_images.post_id = albums_post.post_id
                LEFT JOIN posts ON posts.id = post_images.post_id
                WHERE albums.user_id = ? AND albums.id = ? AND albums.albums_name = ? AND posts.isdeleted IS NULL AND post_images.image IS NOT NULL`;

      const posts: Array<fetchOneAlbumsPostInterface> = (await conn.query(sql, [
        req.query.user_id,
        req.query.album_id,
        req.query.album_name,
      ])) as unknown as Array<fetchOneAlbumsPostInterface>;

      const oneAlbumPost = posts.reduce(
        (
          accumulator: fetchOneAlbumsPostInterfaceAcc,
          item: fetchOneAlbumsPostInterface
        ) => {
          accumulator[item.post_id] ??= {
            id: item.post_id,
            user_id: item.user_id,
            image: [],
            profileId: (req.user as UserId).userId,
            albumId: req.query.album_id?.toString(),
            isvideo: [],
          };

          accumulator[item.post_id].image.push(item.image);
          accumulator[item.post_id].isvideo.push(item.isvideo);
          return accumulator;
        },
        {}
      );

      res.status(200).json(oneAlbumPost);
    } catch (e) {
      logger.error("profileController fetchOneAlbumsPost: ", e);
      res.status(500).send(e);
    }
  },
  async deletePostIdFromalbum(req, res) {
    try {
      const postIds = req.body.ids;
      const albumids = req.body.albumsId;
      const userId = (req.user as UserId).userId;
      let deletePost;

      for (let i = 0; i < postIds.length; i++) {
        let sql = `DELETE FROM albums_post WHERE album_id = ? AND post_id = ?`;
        deletePost = await conn.query(sql, [albumids, postIds[i]]);
      }

      const albumName = `SELECT albums_name FROM albums WHERE id = ?`;
      const [name] = await conn.query(albumName, [albumids]);

      res.json({ userId, albums_name: name }).status(200);
    } catch (e) {
      logger.error("profileController deletePostIdFromalbum: ", e);
      res.status(500).send(e);
    }
  },
  async otherPostShowInAlbums(req, res) {
    try {
      const userId = (req.user as UserId).userId;
      const albumId = req.body.albumId;

      const sql = `SELECT posts.user_id, post_images.post_id, post_images.isvideo, post_images.image, post_images.id AS singleImageId
                FROM posts
                LEFT JOIN post_images ON post_images.post_id = posts.id
                WHERE posts.user_id = ? AND posts.isdeleted IS NULL AND posts.id NOT IN (SELECT post_id FROM albums_post WHERE album_id = ?)`;

      const otherPostInAlbums: Array<otherPostShowInAlbumsInterface> =
        (await conn.query<QueryResult>(sql, [
          userId,
          albumId,
        ])) as unknown as Array<otherPostShowInAlbumsInterface>;

      const multiTagePosts = otherPostInAlbums.reduce(
        (
          accumulator: otherPostShowInAlbumsInterfaceAcc,
          item: otherPostShowInAlbumsInterface
        ) => {
          accumulator[item.post_id] ??= {
            id: item.post_id,
            user_id: item.user_id,
            profileId: (req.user as UserId).userId,
            albumId: req.body.albumId,
            image: [],
            isvideo: [],
          };

          accumulator[item.post_id].image.push(item.image);
          accumulator[item.post_id].isvideo.push(item.isvideo);
          return accumulator;
        },
        {}
      );

      res.status(200).json(multiTagePosts);
    } catch (e) {
      logger.error("profileController otherPostShowAlbums: ", e);
      res.status(500).send(e);
    }
  },
  async addPostInAlbums(req, res) {
    try {
      const albumId = Number(req.body.albumsId);
      const postId = req.body.ids;
      const userId = (req.user as UserId).userId;

      for (let i = 0; i < postId.length; i++) {
        let sql = `INSERT INTO albums_post (album_id, post_id) VALUES (?, ?)`;
        await conn.query(sql, [albumId, postId[i]]);
      }

      res.json(userId).status(200);
    } catch (e) {
      logger.error("profileController addPostInAlbums: ", e);
      res.status(500).send(e);
    }
  },
  async fetchDetails(req, res) {
    try {
      const userId = (req.user as UserId).userId;
      const sql1 = `SELECT COUNT(user_id) AS postcount FROM posts WHERE user_id = ? AND posts.is            deleted IS NULL`;
      const sql2 = `SELECT COUNT(user_id) AS followcount FROM user_follows WHERE follow_id = ?`;
      const sql3 = `SELECT COUNT(user_id) AS followercount FROM user_follows WHERE user_id = ?`;
      const sql4 = `SELECT COUNT(user_id) AS followingcount FROM user_follows WHERE follow_id = ?`;
      const sql5 = `SELECT COUNT(albums.id) AS albumcount FROM albums WHERE user_id = ?`;

      const [postcount] = await conn.query(sql1, [userId]);
      const [followcount] = await conn.query(sql2, [userId]);
      const [followercount] = await conn.query(sql3, [userId]);
      const [followingcount] = await conn.query(sql4, [userId]);
      const [albumcount] = await conn.query(sql5, [userId]);

      res.status(200).json({
        postcount,
        followcount,
        followercount,
        followingcount,
        albumcount,
      });
    } catch (e) {
      logger.error("profileController fetchDetails: ", e);
      res.status(500).send(e);
    }
  },
  async deleteAlbum(req, res) {
    try {
      const albumId = req.body.albumId;

      const sql = `DELETE FROM albums WHERE id = ?`;
      const sql1 = `DELETE FROM albums_post WHERE album_id = ?`;
      const deleteAlbum = await conn.query(sql, [albumId]);
      const deleteAlbumPost = await conn.query(sql1, [albumId]);

      res.status(200).end();
    } catch (e) {
      logger.error("profileController deleteAlbum: ", e);
      res.status(500).send(e);
    }
  },
  async updateAlbumName(req, res) {
    try {
      const albumName = req.body.albumName;
      const albumId = req.body.albumId;
      const userId = (req.user as UserId).userId;

      const sql = `UPDATE albums SET albums_name = ? WHERE id = ? AND user_id = ?`;
      await conn.query(sql, [albumName, albumId, userId]);

      res.status(200).end();
    } catch (e) {
      logger.error("profileController updateAlbumName: ", e);
      res.status(500).send(e);
    }
  },
  async deletePostInAlbumFromHome(req, res) {
    try {
      const postId = req.body.postId;
      const albumId = req.body.albumId;

      const sql = `DELETE FROM albums_post WHERE album_id = ? AND post_id = ?`;
      const deletePostInAlbum = await conn.query(sql, [albumId, postId]);

      res.status(200).end();
    } catch (e) {
      logger.error("profileController deletePostInAlbumFromHome: ", e);
      res.status(500).send(e);
    }
  },
  async onepost(req, res) {
    try {
      const userId = (req.user as UserId).userId;
      const postId = req.query.postId;
      const sql = `SELECT posts.id, posts.user_id, posts.location, posts.like_count, posts.ismultiple, posts.caption, posts.descriptions, post_images.image, post_images.isvideo
                FROM posts
                LEFT JOIN post_images ON post_images.post_id = posts.id
                WHERE posts.user_id = ? AND posts.id = ? AND posts.isdeleted IS NULL`;

      const onePost: Array<onepostInterface> = (await conn.query(sql, [
        userId,
        postId,
      ])) as unknown as Array<onepostInterface>;

      const singlePost = onePost.reduce(
        (accumulator: onepostInterfaceAcc, item: onepostInterface) => {
          accumulator[item.id] ??= {
            id: item.id,
            user_id: item.user_id,
            location: item.location,
            like_count: item.like_count,
            ismultiple: item.ismultiple,
            caption: item.caption,
            descriptions: item.descriptions,
            image: [],
            isvideo: [],
          };

          accumulator[item.id].image.push(item.image);
          accumulator[item.id].isvideo.push(item.isvideo);
          return accumulator;
        },
        {}
      );

      res.status(200).json(singlePost);
    } catch (e) {
      logger.error("profileController onepost: ", e);
      res.status(500).send(e);
    }
  },
};

export default profileController;
