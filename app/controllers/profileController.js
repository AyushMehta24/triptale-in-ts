

const conn = require("../config/mysql_connection");
const logger = require("../config/logger");
const profileController = () => {
    return {

        getUserProfilePage(req, res) {
            res.render("components/profile/userProfilePage")
        },
        getEditProfilePage(req, res) {
            res.render("components/profile/userProfilePage")
        },
        async fetchAlubums(req, res) {
            try {
                const userId = req.user.userId
                const sql = `SELECT * FROM albums where user_id= ? `
                const sql1 = `select albums.id , albums.albums_name , albums.user_id,albums_post.post_id ,post_images.image,posts.isdeleted ,post_images.isvideo
                from albums left join albums_post on albums.id = albums_post.album_id
                left join post_images on post_images.post_id =albums_post.post_id left join posts on posts.id = post_images.post_id where albums.user_id =?`
                let [albums] = await conn.query(sql, [userId]);
                const [albumsCoverImage] = await conn.query(sql1, [userId])


                const multiplePost = albumsCoverImage.reduce((accumulator, item) => {

                    accumulator[item.id] ??= {
                        id: item.id,
                        user_id: item.user_id,
                        albums_name: item.albums_name,
                        post_id: [],
                        isdeleted: item.isdeleted,
                        isvideo:[]

                    }
                    if (item.isdeleted == null) {
                        accumulator[item.id].post_id.push(item.image);
                        accumulator[item.id].isvideo.push(item.isvideo)
                    }
                    return accumulator
                }, {})


                res.send({ albums: albums, albumsCoverImage: multiplePost })
                res.end();
            } catch (e) {
                logger.error("profileController fetchAlubums: " + e.message)
                res.status(500);
                res.send(e)
            }
        },

        async createAlbums(req, res) {
            try {

                const alubamName = req.body.albumName.trim();
                const userId = req.user.userId
                if (alubamName.length != 0) {
                    const sql = `insert into albums (user_id,albums_name) values (?,?);`
                    const data = await conn.query(sql, [userId, alubamName])
                    res.status(200)
                    res.end();
                }
                else {
                    res.status(500)
                }
            } catch (e) {
                logger.error("profileController createAlbum: " + e.message)
                res.status(500);
                res.send(e)
            }
        },
        async fetchPosts(req, res) {
            try {
                const userId = req.user.userId
                const sql = ` select user_profiles.user_id , user_profiles.first_name ,user_profiles.last_name ,user_profiles.username,user_profiles.profile_image,
                posts.id ,posts.location ,posts.like_count,posts.comment_count ,posts.ismultiple,posts.caption ,posts.descriptions,post_images.image,post_images.isvideo
               from posts left join user_profiles on user_profiles.user_id = posts.user_id  
               left join  post_images on posts.id = post_images.post_id
               where user_profiles.user_id =?  and posts.isdeleted is Null  ORDER BY posts.create_at DESC`;
                const [posts] = await conn.query(sql, [userId]);

                const multiplePost = posts.reduce((accumulator, item) => {

                    accumulator[item.id] ??= {
                        id: item.id,
                        user_id: item.user_id,
                        image: [],
                        isvideo: []

                    }

                    accumulator[item.id].image.push(item.image);
                    accumulator[item.id].isvideo.push(item.isvideo);
                    return accumulator
                }, {})

                res.json({ posts: posts, multiplePost: multiplePost });
                res.status(200);
            } catch (e) {
                logger.error("profileController fetchPosts: " + e.message)
                res.status(500);
                res.send(e)
            }
        },
        async fetchPopupPosts(req, res) {
            try {
                const user = req.query.user;
                const post = req.query.post

                const sql = ` select user_profiles.user_id , user_profiles.first_name ,user_profiles.last_name ,user_profiles.username,user_profiles.profile_image,
                posts.id ,posts.location ,posts.like_count,posts.comment_count ,posts.ismultiple,posts.caption ,posts.descriptions,post_images.image
               from posts left join user_profiles on user_profiles.user_id = posts.user_id  
               left join  post_images on posts.id = post_images.post_id
               where user_profiles.user_id =? and posts.id=?;`
                const [popupPost] = await conn.query(sql, [user, post])


                const multiplePost = popupPost.reduce((accumulator, item) => {

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
                        caption: item.caption

                    }

                    accumulator[item.id].image.push(item.image)
                    return accumulator
                }, {})


                res.render("/components/profile/homeMain.ejs", { showPosts: multiplePost })
                res.status(200).json(multiplePost)
            } catch (e) {
                logger.error("profileController fetchPopupPosts: " + e.message)
                res.status(500);
                res.send(e)
            }
        },
        async fetchTagePost(req, res) {
            try {
                const userId = req.user.userId

                const sql = `select post_people_tags.user_id ,post_people_tags.post_id ,posts.user_id as users ,posts.location ,posts.like_count,posts.isdeleted,posts.comment_count ,posts.ismultiple,posts.caption ,posts.descriptions,post_images.image,post_images.isvideo, user_profiles.first_name ,user_profiles.last_name ,user_profiles.username ,user_profiles.profile_image from posts left join post_people_tags on post_people_tags.post_id = posts.id   left join  post_images on posts.id = post_images.post_id left join user_profiles on user_profiles.user_id = posts.user_id where post_people_tags.user_id= ? and posts.isdeleted is Null`

                const [posts] = await conn.query(sql, [userId]);
                const multiTagePosts = posts.reduce((accumulator, item) => {

                    accumulator[item.post_id] ??= {
                        id: item.post_id,
                        user_id: item.users,
                        image: [],
                        profileId: userId,
                        isvideo: []
                    }

                    accumulator[item.post_id].image.push(item.image);
                    accumulator[item.post_id].isvideo.push(item.isvideo);
                    return accumulator
                }, {})
                res.status(200).json(multiTagePosts)

            } catch (e) {
                logger.error("profileController fetchTagePost: " + e.message)
                res.status(500);
                res.send(e)

            }
        },
        async fetchOneAlbumsPost(req, res) {
            try {

                const sql = `select albums.id ,albums.user_id, albums.albums_name ,albums_post.
                post_id ,post_images.image,post_images.isvideo,posts.isdeleted from albums left join albums_post on albums_post.album_id= albums.id left join post_images on post_images.post_id = albums_post.post_id   left join posts on posts.id = post_images.post_id     where albums.user_id= ? and albums.id = ? and albums.albums_name =? and posts.isdeleted is Null and  post_images.image is not null `

                const [posts] = await conn.query(sql, [req.query.user_id, req.query.album_id, req.query.album_name]);

                const oneAlbumPost = posts.reduce((accumulator, item) => {

                    accumulator[item.post_id] ??= {
                        id: item.post_id,
                        user_id: item.user_id,
                        image: [],
                        profileId: req.user.userId,
                        albumId: req.query.album_id,
                        isvideo: []
                    }

                    accumulator[item.post_id].image.push(item.image)
                    accumulator[item.post_id].isvideo.push(item.isvideo)
                    return accumulator
                }, {})

                res.status(200).json(oneAlbumPost)


            } catch (e) {
                logger.error("profileController fetchOneAlbumsPost: " + e.message)
                res.status(500);
                res.send(e)

            }

        },
        async deletePostIdFromalbum(req, res) {
            try {

                const postIds = req.body.ids;
                const albumids = req.body.albumsId
                const userId = req.user.userId
                let deletePost

                for (let i = 0; i < postIds.length; i++) {
                    let sql = ` delete from albums_post where album_id =?  and post_id =? `;
                    deletePost = await conn.query(sql, [albumids, postIds[i]]);
                }
                const albumName = `SELECT albums_name FROM  albums where id =?`;
                const [name] = await conn.query(albumName, [albumids])

                res.json({ userId, albums_name: name }).status(200);
            } catch (e) {
                logger.error("profileController deletePostIdFromalbum: " + e.message)
                res.status(500);
                res.send(e)
            }
        },
        async otherPostShowInAlbums(req, res) {
            try {
                const userId = req.user.userId
                const albumId = req.body.albumId;



                const sql = `select posts.user_id ,post_images.post_id ,post_images.isvideo
                            ,post_images.image,post_images.id as singleImageId
                            from posts left join post_images on  post_images.post_id = posts.id
                            where  posts.user_id= ? and posts.isdeleted is Null  and posts.id not in(select post_id from albums_post  where album_id = ?)`
                const [otherPostInAlbums] = await conn.query(sql, [userId, albumId]);

                const multiTagePosts = otherPostInAlbums.reduce((accumulator, item) => {

                    accumulator[item.post_id] ??= {
                        id: item.post_id,
                        user_id: item.user_id,
                        profileId: req.user.userId,
                        albumId: req.body.albumId,
                        image: [],
                        isvideo: []
                    }

                    accumulator[item.post_id].image.push(item.image)
                    accumulator[item.post_id].isvideo.push(item.isvideo)
                    return accumulator
                }, {})
                    
                res.status(200).json(multiTagePosts);
            } catch (e) {
                logger.error("profileController otherPostShowAlbums: " + e.message)
                res.status(500);
                res.send(e)
            }
        },
        async addPostInAlbums(req, res) {
            try {

                const albumId = Number(req.body.albumsId)
                const postId = req.body.ids;
                const userId = req.user.userId
           

                for (let i = 0; i < postId.length; i++) {
                    let sql = ` insert into albums_post (album_id ,post_id ) values (? ,? )`;

                    addPost = await conn.query(sql, [albumId, postId[i]]);
                }

                res.json(userId).status(200)
            } catch (e) {
                logger.error("profileController addPostInAlbums: " + e.message)
                res.status(500);
                res.send(e)
            }
        },
        async fetchDetails(req, res) {
            try {
                const userId = req.user.userId
                const sql1 = ` select count(user_id) as postcount  from posts  where user_id = ? AND posts.isdeleted is Null`;

                const sql2 = `select count(post_people_tags.user_id) as tagcount from               post_people_tags left join posts on posts.id = post_people_tags.post_id where post_people_tags.user_id = ? and  post_people_tags.isdeleted is null and posts.isdeleted is Null`
                const sql3 = ` select count(user_id)as albumcount from albums where user_id = ?`;
                const sql4 = `SELECT * FROM user_profiles where user_id = ?`
                const [postCount] = await conn.query(sql1, [userId]);
                const [tagPostCount] = await conn.query(sql2, [userId]);
                const [albumCount] = await conn.query(sql3, [userId]);
                const [profileDetails] = await conn.query(sql4, [userId]);

                res.json({ postCount, tagPostCount: tagPostCount, albumCount: albumCount, profileDetails: profileDetails })
            } catch (e) {
                logger.error("profileController fetchDetails: " + e.message)
                res.status(500);
                res.send(e)
            }
        },
        async deleteAlbum(req, res) {
            try {

                const albumId = req.body.albumId;
                const albumName = req.body.albumName;
                const userId = req.user.userId;
                const sql = `delete from albums where id =? and user_id=? and  albums_name=?`

                const sql2 = `delete from albums_post where album_id = ?`;
                const [deleteAlbumPost] = await conn.query(sql2, [albumId])
                const [deleteAlbums] = await conn.query(sql, [albumId, userId, albumName]);

                res.json("sucess").status(200);
            } catch (e) {
                logger.error("profileController deleteAlbum: " + e.message)
                res.status(500);
                res.send(e)
            }

        },

        async updateAlbumName(req, res) {
            try {
                const albumName = req.body.albumNewName.trim()
                if (albumName.length != 0) {
                    const sql = `update albums set albums_name = ? where id = ? and user_id = ? `
                    const [update] = await conn.query(sql, [req.body.albumNewName, req.body.albumId, req.user.userId])
                    res.status(200).json("sucess");
                }
                else {
                    res.status(500)
                }
            } catch (e) {
                logger.error("profileController updateAlbumName: " + e.message)
                res.status(500);
                res.send(e)
            }

        },
        async deletePostInAlbumFromHome(req, res) {
            try {
                const postIds = req.body.ids;
                const albumids = req.body.albumsId

                let deletePost
                const albumId = `SELECT album_id FROM albums_post where post_id=?`
                const [albumsId] = await conn.query(albumId, [postIds])
                const album_Id = albumsId[0].album_id
                const sql = ` delete from albums_post where album_id =?  and post_id =? `;
                deletePost = await conn.query(sql, [album_Id, postIds]);

                res.json("sucess").status(200);
            } catch (e) {
                logger.error("profileController deletePostInAlbumFromHome: " + e.message)
                res.status(500);
                res.send(e)
            }
        },
        async onepost(req, res) {
            let userId = req.user.userId;

            let post_id = req.query.post_id;

            let user_id2 = req.query.user_id;


            try {
                let count_q
                if (req.query.albumPost) {
                    [count_q] = await conn.query(
                        `select count(*) as counter from albums where id = ? and user_id = ?;`,
                        [req.query.albumId, user_id2]
                    );

                } else {
                    [count_q] = await conn.query(
                        `select count(*) as counter from posts where id = ? and user_id = ?;`,
                        [post_id, user_id2]
                    );
                }

                let sql1 = `SELECT 
                 posts.id,user.user_id as userId,user.username, post.image,posts.ismultiple,posts.location,user.profile_image, privacy.privacy,posts.like_count,posts.comment_count,posts.isdeleted,posts.caption, posts.create_at,post.isvideo,
                 (SELECT   IF(isdeleted IS NULL, 0, 1) FROM  post_likes pl WHERE  pl.post_id = posts.id  AND pl.liked_by = ?) AS flag,
                 (SELECT  post_id FROM albums_post album   INNER JOIN  albums ON album.album_id = albums.id WHERE album.post_id = posts.id  AND albums.user_id = ? limit 1) as save_posts
                 FROM  posts
                  INNER JOIN users_auth ON posts.user_id = users_auth.id
                  INNER JOIN  user_profiles user ON user.user_id = users_auth.id
                  INNER JOIN   post_images post ON post.post_id = posts.id
                  INNER JOIN    privacy ON posts.privacy_id = privacy.id  `;
                let sql = `SELECT 
                posts.id,users_auth.id AS userId,user.username,post.image,posts.ismultiple,posts.location,user.profile_image,privacy.privacy,posts.like_count,posts.comment_count,posts.isdeleted,posts.caption,posts.create_at, post.isvideo,
               (SELECT  IF(isdeleted IS NULL, 0, 1) FROM  post_likes pl  WHERE pl.post_id = posts.id  AND pl.liked_by = ?) AS flag,
               (SELECT  post_id  FROM   albums_post album   INNER JOIN  albums ON album.album_id = albums.id  WHERE album.post_id = posts.id AND albums.user_id = ? limit 1) as save_posts  FROM  posts  INNER JOIN  users_auth ON posts.user_id = users_auth.id   INNER JOIN   user_profiles user ON user.user_id = users_auth.id    INNER JOIN   post_images post ON post.post_id = posts.id   INNER JOIN     privacy ON posts.privacy_id = privacy.id WHERE  `

                if (count_q[0].counter == 1) {
                    if (req.query.tagPost) {

                        sql1 += `inner join  post_people_tags on post_people_tags.user_id=posts.user_id
                                 WHERE posts.id in (SELECT post_id FROM post_people_tags where user_id = ?)
                                 AND posts.isdeleted IS NULL  ORDER BY posts.create_at DESC;`

                        var [result] = await conn.query(sql1, [user_id2, user_id2, req.query.profileId]);
                    } else if (req.query.albumPost) {
                        sql1 += ` WHERE  posts.id in (SELECT post_id FROM  albums_post where album_id=?)
                                  AND posts.isdeleted IS NULL  ORDER BY posts.create_at DESC;`

                        var [result] = await conn.query(sql1, [req.query.profileId, req.query.profileId, req.query.albumId]);
                    }


                    else if (user_id2 == userId) {

                        sql += `
                         users_auth.id = ?
                            AND posts.isdeleted IS NULL
                    ORDER BY posts.create_at DESC;`;

                        var [result] = await conn.query(sql, [userId, userId, userId]);
                    } else {
                        sql += `posts.privacy_id = 1
                        and users_auth.id = ?
                            AND posts.isdeleted IS NULL
                    ORDER BY posts.create_at DESC;`;

                        var [result] = await conn.query(sql, [user_id2, user_id2, user_id2]);
                    }
                    result.forEach((date) => {
                        let timeDiff = new Date(Date.now()) - date.create_at;
                        let minute = Math.ceil(timeDiff / 1000 / 60);
                        let hours = Math.ceil(minute / 60);
                        let days = Math.ceil(hours / 24);
                        if (minute <= 59) {
                            date.create_at = minute + " minutes ago";
                        } else if (hours <= 24) {
                            date.create_at = hours + " hours ago";
                        } else if (days <= 5) {
                            date.create_at = days + " days ago";
                        } else {
                            date.create_at = date.create_at.toDateString();
                        }
                    });
                    result = Object.values(
                        result.reduce(
                            (
                                acc,
                                {
                                    id, userId, username, image, ismultiple, location, profile_image, privacy, like_count, comment_count, caption, create_at, flag, save_posts, isvideo
                                }
                            ) => {
                                acc[id] ??= {
                                    id, userId, username, image: [], ismultiple, location, profile_image, privacy, like_count, comment_count, caption, create_at, flag, save_posts, isvideo: []
                                };

                                acc[id].image.push(image);
                                acc[id].isvideo.push(isvideo);
                                return acc;
                            },
                            {}
                        )
                    );
                    res.render("components/home/homeMain", {
                        showPosts: result, postId: post_id
                    });
                }

                else {
                    res.redirect("/userProfile")
                }
            } catch (error) {
                logger.error("profile Controller onepost function: " + error.message);
            }


        },


    }
}

module.exports = profileController;
