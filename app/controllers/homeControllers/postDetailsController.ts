import logger from "../../config/logger";
import connection from "../../config/mysql_connection";
import { UserId } from "../../../index";
import { Request, Response } from "express";
import { QueryResult, ResultSetHeader } from "mysql2";
import {
  postDetailqueryInterface,
  postDetailqueryInterfaceAcc,
} from "../../../dto/postDetailControllerInterface";

export async function getDetails(req: Request, res: Response) {
  try {
    const id = req.body.postId;
    const postDetailsQuery =
      "select user.username, posts.location, posts.like_count, posts.comment_count, posts.descriptions,posts.ismultiple, post_images.image, user.profile_image, post_images.isvideo from posts inner join users_auth on posts.user_id = users_auth.id inner join user_profiles user on user.user_id = users_auth.id inner join post_images on post_images.post_id = posts.id where posts.id = ?";

    const hashtagQuery =
      "select name from hashtags inner join post_hashtags on post_hashtags.tag = hashtags.id where post_hashtags.post_id = ?";

    const tagPeopleQuery =
      "select user.username from user_profiles user inner join post_people_tags on post_people_tags.user_id = user.user_id where post_people_tags.post_id = ?";

    let result: Array<postDetailqueryInterface> = (await connection.query(
      postDetailsQuery,
      id
    )) as unknown as Array<postDetailqueryInterface>;
    const [hashtagRes] = await connection.query(hashtagQuery, id);
    const [tagPeopleRes] = await connection.query(tagPeopleQuery, id);
    result = Object.values(result);
    res.status(200).json({
      postData: result,
      hashTags: hashtagRes,
      tagPeoples: tagPeopleRes,
    });
  } catch (error) {
    console.log(error);
    logger.error("Post Details Controller getDetail function" + error);
  }
}
