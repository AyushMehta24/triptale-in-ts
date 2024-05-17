const connection = require("../config/mysql_connection");
const logger = require("../config/logger");
const homefunc = require('./homeControllers/homeController');

const searchcontroller = () => {
  return {
    async getpage(req, res) {
      try {
        let result = await connection.query(`  select p.id,p.user_id,
        (select pi.image from post_images pi where pi.post_id = p.id order by pi.id limit 1) 
        image , (select isvideo from post_images pi where pi.post_id = p.id limit 1) isvideo from posts p
        where p.isdeleted is null and p.privacy_id = 1  
		    order by p.update_at desc limit 100;`);

        res.render("components/search/search", { result: result[0] });
      } catch (error) {
        logger.error("search Controller getPage function: " + error.message);
      }
    },
    async getUsersUserName(req, res) {
      try {
        let usernames = [];
        let result = await connection.query(
          `select distinct(username) from user_profiles where username like ""?"%"`,
          [req.body.userLike]
        );
        result[0].forEach((item) => {
          usernames.push(item.username);
        });
        return res.json(usernames);
      } catch (error) {
        logger.error(
          "search Controller getuserusername function: " + error.message
        );
      }
    },
    //this is for the search suggestion
    async getHashTags(req, res) {
      try {
        let hashtagNames = [];
        let result = await connection.query(
          `select distinct(name) from hashtags where name like ""?"%"`,
          [req.body.hashtagLike]
        );

        result[0].forEach((item) => {
          hashtagNames.push(item.name);
        });
        return res.json(hashtagNames);
      } catch (error) {
        logger.error(
          "search Controller gethashtags function: " + error.message
        );
      }
    },
    //this is for the searchsuggestions
    async getLocation(req, res) {
      try {
        let locationNames = [];
        let result2 = await connection.query(
          `select distinct(location) from posts where location like ""?"%"`,
          [req.body.locationLike]
        );

        result2[0].forEach((item) => {
          locationNames.push(item.location);
        });
        return res.json(locationNames);
      } catch (error) {
        logger.error(
          "search Controller getlocation function: " + error.message
        );
      }
    },
    async onepost(req, res) {

      let post_id = req.query.post_id;

      let user_id2 = req.query.user_id;

      let [count_q] = await connection.query(
        `select count(*) as counter from posts where id = ? and user_id = ? ;`, [post_id, user_id2]);

      if (count_q[0].counter == 1) {
        try {
          const result = await homefunc().getHome(req);

          let tempobj = {};
          result.forEach((e, i) => {
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
          logger.error("search Controller onepost function: " + error.message);
        }
      } else {
        res.redirect("/search");
      }
    },
    async getprofilepage(req, res) {
      let user_id = req.query.userid;
      let userId = req.user.userId;

      if (user_id == userId) {
        res.redirect("/userProfile");
        return;
      }

      let [count_q] = await connection.query(
        `select count(*) as counter from user_profiles where user_id = ? ;`,
        [user_id]
      );

      if (count_q[0].counter == 1) {
        try {
          let query = `select * from user_profiles where user_id = ? ;`;

          let result = await connection.query(query, user_id);

          //let query_2 = `select user_profiles.user_id , user_profiles.first_name ,user_profiles.last_name ,user_profiles.username,user_profiles.profile_image, posts.id ,posts.location ,posts.like_count,posts.comment_count ,posts.ismultiple,posts.caption ,posts.descriptions,post_images.image from posts left join user_profiles on user_profiles.user_id = posts.user_id left join  post_images on posts.id = post_images.post_id where user_profiles.user_id =?  and posts.isdeleted is Null and  posts.privacy_id = 1`;

          let query_2 = `select user_id, posts.id ,posts.ismultiple,post_images.image ,post_images.isvideo from posts ,post_images
                         where posts.user_id = ? and posts.id = post_images.post_id 
                         and posts.isdeleted is Null and  posts.privacy_id = 1;`

          let result2 = await connection.query(query_2, user_id);
          const multiplePost = result2[0].reduce((accumulator, item) => {
            accumulator[item.id] ??= {
              id: item.id,
              user_id: item.user_id,
              image: [],
              isvideo:[]
            };

            accumulator[item.id].image.push(item.image);
            accumulator[item.id].isvideo.push(item.isvideo);
            return accumulator;
          }, {});

    
          //  let query_3 = `select image,user_id,post_images.post_id from post_images inner join post_people_tags on post_people_tags.post_id = post_images.post_id where user_id = ? ;`
          let query_3 = `		select post_people_tags.user_id ,post_people_tags.post_id ,posts.user_id as users 
                            ,post_images.image,post_images.isvideo,posts.ismultiple
                            from post_images inner join post_people_tags on post_people_tags.post_id = post_images.post_id
                            inner join posts on posts.id = post_images.post_id
                            where post_people_tags.user_id= ? and posts.isdeleted is Null ORDER BY posts.create_at DESC;`;

          let result3 = await connection.query(query_3, user_id);
          const multiTagePosts = result3[0].reduce((accumulator, item) => {
            accumulator[item.post_id] ??= {
              id: item.post_id,
              user_id: item.users,
              image: [],
              profileId: user_id,
              isvideo:[]
            };

            accumulator[item.post_id].image.push(item.image);
            accumulator[item.post_id].isvideo.push(item.isvideo);
            return accumulator;
          }, {});

          res.render("components/search/seeprofile", {
            result: result[0],
            result2: multiplePost,
            result3: multiTagePosts,
          });

        } catch (error) {
          logger.error(
            "search Controller getprofilepage function: " + error.message
          );
        }
      } else {
        res.redirect("/search");
      }
    },
    async postsearchpage(req, res) {
      let search = req.body.search.trim();

      search = search.replaceAll("'", "");
      try {
        if(search){

        let searchhistory = `insert into search_history(user_id,search) values
        (?,?);`;

        let history = await connection.query(searchhistory, [
          req.user.userId,
          search,
        ]);

        //for account search
        let accounts = `select user_id,username from user_profiles where username LIKE "%"?"%" ;  `;

        let result3 = await connection.query(accounts, search);

        //for location search
        let query_search = ` SELECT user_id,posts.id as post_id,(select pi.image from post_images pi where pi.post_id = posts.id order by pi.id limit 1) image,
                             (select isvideo from post_images pi where pi.post_id = posts.id limit 1) isvideo 
                             FROM posts 
                             where posts.privacy_id = 1 and posts.isdeleted is null and location like "%"?"%" `;

        let result2 = await connection.query(query_search, search);

        //for tags search
        let tags = `SELECT distinct(post_id) FROM post_hashtags INNER JOIN hashtags ON post_hashtags.tag = hashtags.id where name like "%"?"%" `;

        let result4 = await connection.query(tags, search);

        let result = [];

        if (result4[0].length != 0) {
          let str = `select distinct(post_id) ,user_id,image,post_images.isvideo from posts inner join post_images on post_images.post_id = posts.id where posts.privacy_id = 1 and posts.isdeleted is null and post_id in ( `;

          for (let i = 0; i < result4[0].length; i++) {
            str += result4[0][i].post_id + ",";
          }
          str = str.slice(0, str.length - 1) + ")";

          result = await connection.query(str);
        }
        res.render("components/search/aftersearch", {
          search,
          result: result[0],
          result2: result2[0],
          result3: result3[0],
        });
      }else{
        res.redirect("/search");
      }
      } catch (error) {
        logger.error(
          "search Controller postsearchpage function: " + error.message
        );
      }
    },
  };
};

module.exports = searchcontroller;
