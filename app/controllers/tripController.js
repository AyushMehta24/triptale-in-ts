const conn = require("../config/mysql_connection");
const logger = require("../config/logger");
const { readSync } = require("fs");
const { session } = require("passport");
const tripinsert = () => {
  return {
    async tripDetails(req, res) {
      try {
        let data = {
          user_id: req.user.userId,
          title: req.body.title,
          discription: req.body.description,
          start_date: req.body.startdate,
          end_date: req.body.enddate,
          trip_type_id: req.body.triptype,
          cover_image: req.user.userId + "/" + req.file.filename,
          location: req.body.location,
        };
        const insert = await conn.query(
          `INSERT INTO trip_details SET ?;`,
          data
        );
        let trip_id = insert[0].insertId;

        // Trip Members Add..
        const result = await conn.query(
          `INSERT INTO trip_members(trip_id,user_id)
                values('${trip_id}','${req.user.userId}')`
        );
        if (req.body.members) {
          req.body.members.forEach(async (data) => {
            try {
              const userId = await conn.query(
                `SELECT user_id FROM user_profiles  WHERE userName = "${data}"`
              );
              if (userId[0].length == 1) {
                let members = {
                  trip_id: trip_id,
                  user_id: userId[0][0].user_id,
                };
                const data = await conn.query(
                  `INSERT INTO trip_members SET ?`,
                  members
                );

                let objectNotificationTrip = {
                  trip_id: trip_id,
                  create_user_id: req.user.userId,
                  add_user_id: userId[0][0].user_id,
                };
                const insertNotification = await conn.query(
                  `INSERT INTO notification_trip set ?
                  `,
                  objectNotificationTrip
                );
                let [trip_details] = await conn.query(
                  `SELECT * FROM trip_details where trip_id=?`,
                  trip_id
                );
                let [userDetail] = await conn.query(
                  `SELECT * FROM user_profiles where user_id=1;`,
                  req.user.userId
                );
                let io = req.app.get("socketio");
                io.on("connection", (socket) => {
                  socket.broadcast.emit(
                    `notification-like-${userId[0][0].user_id}`,
                    {
                      create_user_id: req.user.userId,
                      profile_image: userDetail[0].userDetail,
                      username: userDetail[0].username,
                      name: userDetail[0].first_name + userDetail[0].last_name,
                      profile_image: userDetail[0].profile_image,
                      cover_image: trip_details[0].cover_image,
                    },
                    "you are add to this trip",
                    true
                  );
                  socket.disconnect();
                });

                io.on("disconnect", function () {});
              }
            } catch (error) {
              res.redirect("/error");
              logger.error(error);
            }
          });
        }

        if (insert.user_id != "") {
          res.render;
          res.redirect("/displayTrip");
        }
      } catch (error) {
        res.redirect("/error");
        logger.error(error);
      }
    },

    createTrip(req, res) {
      res.render("components/create/trips/createtrip");
    },

    async dayByDay(req, res) {
      try {
        let userId = req.user.userId;
        let tid = req.params.tid;
        const repeatDates = await conn.query(
          `select dates from trip_days where trip_id=${tid} and deleted_at is NULL;`
        );

        const dates = await conn.query(
          `SELECT start_date as sd,end_date as ed from trip_details where trip_id='${tid}';`
        );
        startDate = dates[0][0].sd;
        endDate = dates[0][0].ed;
        sql =
          "select  trip_details.trip_id from trip_members join trip_details on trip_details.trip_id = trip_members.trip_id where trip_members.user_id = ?";
        let [result] = await conn.query(sql, userId);
        if (result.length > 0) {
          for (let i = 0; i < result.length; i++) {
            if (result[i].trip_id == tid) {
              return res.render("components/create/trips/daybyday", {
                tid: tid,
                repeatDates: repeatDates,
              });
            }
          }
          return res.redirect("/PageNotFound");
        } else {
          return res.redirect("/PageNotFound");
        }
      } catch (error) {
        logger.error("tripCotroller daybyday: " + error);
      }
    },

    async fetchmembers(req, res) {
      const result = await conn.query(`SELECT userName from user_profiles;`);
      res.json({ result: result[0] });
    },

    async daybydayinsert(req, res) {
      try {
        let data = {
          trip_id: req.body.tid,
          discription: req.body.description,
          title: req.body.title,
          location: req.body.location,
          dates: req.body.date,
        };

        // Day by Day insertion

        const result = await conn.query(`INSERT INTO trip_days  SET ?;`, data);

        if (req.files) {
          for (let i = 0; i < req.files.length; i++) {
            let dayId = await conn.query(
              `SELECT id from trip_days where trip_id=? and dates=? and deleted_at is NULL`,
              [req.body.tid, req.body.date]
            );

            let dayphotos = {
              image: req.body.tid + "/" + req.files[i].filename,
              day_id: dayId[0][0].id,
            };
            const videoType = ["mp4", "webm"];
            if (videoType.includes(req.files[i].filename.split(".").pop())) {
              const sql = `INSERT INTO trip_images(image,day_id,is_video) values(?,?,?)`;
              const data1 = await conn.query(sql, [
                req.body.tid + "/" + req.files[i].filename,
                dayId[0][0].id,
                1,
              ]);
            } else {
              const sql = `INSERT INTO trip_images(image,day_id,is_video) values(?,?,?)`;
              const data1 = await conn.query(sql, [
                req.body.tid + "/" + req.files[i].filename,
                dayId[0][0].id,
                0,
              ]);
            }
          }
        }
        res.redirect(`/trips/insertdays/${req.body.tid}`);
      } catch (error) {
        logger.error("tripControllr daybydayinsert: " + error);
        res.redirect("/catch");
      }
    },

    async editmembers(req, res) {
      try {
        const userId = req.user.userId;
        const tripId = req.params.tid;
        sql = `select profile_image , username , user_profiles.user_id , trip_members.trip_id from trip_members join user_profiles on user_profiles.user_id = trip_members.user_id where trip_id = ? and trip_members.user_id != ? and deleted_at is NULL;`;
        const [result] = await conn.query(sql, [tripId, userId]);

        if (result.length == 0) {
          sql = `select trip_members.user_id , trip_members.trip_id from trip_members join user_profiles on user_profiles.user_id = trip_members.user_id where trip_id = ? and deleted_at is NULL  and trip_members.user_id = ?`;
          const [result1] = await conn.query(sql, [tripId, userId]);
          if (result1.length == 1) {
            res.render("components/create/trips/addmember", {
              data: result1,
              userId,
              numberOfMember: "zero",
            });
          }
        } else if (result.length > 0) {
          res.render("components/create/trips/addmember", {
            data: result,
            userId,
            numberOfMember: "some",
          });
        } else {
          res.redirect("/noDataFound");
        }
      } catch (error) {
        logger.error("tripController editmembers: " + error);
      }
    },

    async editMembersPost(req, res) {
      try {
        const { deleterId, deletedId, tripId } = req.body;
        sql = `update trip_members set deleted_at = current_timestamp() , deleted_by = ? where user_id = ? and trip_id = ?;`;
        const [result] = await conn.query(sql, [deleterId, deletedId, tripId]);
      } catch (error) {
        logger.error("tripController editMembersPost: " + error);
      }
    },

    async addMembersPost(req, res) {
      try {
        const { userName, tripId } = req.body;
        let sql = `select user_id from user_profiles where username = ? `;
        const [result] = await conn.query(sql, [userName]);
        let data = { trip_id: tripId, user_id: result[0].user_id };
        sql = `insert into trip_members SET ? `;
        const [result1] = await conn.query(sql, data);

        let objectNotificationTrip = {
          trip_id: tripId,
          create_user_id: req.user.userId,
          add_user_id: result[0].user_id,
        };
        let insertNotification = await conn.query(
          `INSERT INTO notification_trip set ?
          `,
          objectNotificationTrip
        );

        let [trip_details] = await conn.query(
          `SELECT * FROM trip_details where trip_id=?`,
          tripId
        );
        let [userDetail] = await conn.query(
          `SELECT * FROM user_profiles where user_id=1;`,
          req.user.userId
        );

        res.json({
          id: result[0].user_id,
          data: {
            create_user_id: req.user.userId,
            profile_image: userDetail[0].userDetail,
            username: userDetail[0].username,
            name: userDetail[0].first_name + userDetail[0].last_name,
            profile_image: userDetail[0].profile_image,
            cover_image: trip_details[0].cover_image,
          },
        });
      } catch (error) {
        logger.error("tripConroller addMembersPost: " + error);
      }
    },

    async newMemberRemove(req, res) {
      try {
        // let ids=[]
        const { userName, tripId } = req.body;
        const newuser = userName.trim();
        let sql = `select user_id  from user_profiles where username = ?`;
        const [result] = await conn.query(sql, [newuser]);
        const deletedId = result[0].user_id;
        const deleterId = req.user.userId;
        sql = `update trip_members set deleted_at = current_timestamp() , deleted_by = ? where user_id = ? and trip_id = ?;`;
        await conn.query(sql, [deleterId, deletedId, tripId]);
      } catch (error) {
        logger.error("tripController newMemberRemove: " + error);
      }
    },

    async getLocation(req, res) {
      try {
        let locationNames = [];
        const result2 = await conn.query(
          `select distinct(location) from trip_post_location where location like "${req.body.locationLike}%"`
        );

        result2[0].forEach((item) => {
          locationNames.push(item.location);
        });
        return res.json(locationNames);
      } catch (error) {
        logger.error("tripController getLocation: " + error);
        return res.json({ error: error });
      }
    },

    async removeImage(req, res) {
      try {
        const deleterId = req.body.deleterId;
        const imageName = req.body.imageName;
        const sql = `update trip_images set deleted_at = current_timestamp() , deleted_by = ? where image = ?`;
        await conn.query(sql, [deleterId, imageName]);
      } catch (error) {
        logger.error("tripController removeImage: " + error);
      }
    },

    async addImage(req, res) {
      try {
        const tid = req.body.tid;
        const did = req.body.did;

        for (let i = 0; i < req.files.length; i++) {
          let dayphotos = {};
          if (
            req.files[i].mimetype == "image/png" ||
            req.files[i].mimetype == "image/jpeg" ||
            req.files[i].mimetype == "image/jpg"
          ) {
            dayphotos = {
              image: req.body.tid + "/" + req.files[i].filename,
              day_id: req.body.did,
              is_video: "0",
            };
            await conn.query(`INSERT INTO trip_images SET ?`, dayphotos);
          } else {
            dayphotos = {
              image: req.body.tid + "/" + req.files[i].filename,
              day_id: req.body.did,
              is_video: "1",
            };
            await conn.query(`INSERT INTO trip_images SET ?`, dayphotos);
          }
        }

        res.redirect(`/displayTrip/images/${tid}/${did}`);
      } catch (error) {
        logger.log("tripController addImage: " + error);
      }
    },

    async removeTrip(req, res) {
      try {
        const { tripId, deleterId } = req.body;
        const sql = `update trip_details set deleted_at = current_timestamp() , deleted_by = ? where trip_id = ?`;
        await conn.query(sql, [deleterId, tripId]);
      } catch (error) {
        logger.error("trip controller remove trip function: " + error.message);
      }
    },
    async leaveTrip(req, res) {
      const { tripId, deleterId } = req.body;
      const sql = `update trip_members set deleted_at = current_timestamp() , deleted_by = ? where trip_id = ? and user_id = ?`;
      await conn.query(sql, [deleterId, tripId, deleterId]);
    },

    async deleteTripDay(req, res) {
      try {
        await conn.beginTransaction();
        let result = await conn.query(
          "update trip_days set deleted_at = CURRENT_TIMESTAMP,deleted_by = ? where id = ?",
          [req.user.userId, req.query.did]
        );
        result = await conn.query(
          "update trip_images set  deleted_by = ?,deleted_at = CURRENT_TIMESTAMP  where day_id = ?",
          [req.user.userId, req.query.did]
        );
        await conn.commit();
        return res.json({ error: false });
      } catch (error) {
        logger.error("tripcontroller deleteTripDay: " + error);
        await conn.rollback();
        return res.json({ error: true });
      }
    },
    async updateDayForm(req, res) {
      try {
        const result = await conn.query(
          "select id,title,discription,location from trip_days where id = ?",
          [req.query.did]
        );
        return res.render("components/create/trips/updateDay", {
          data: result[0][0],
        });
      } catch (error) {
        logger.error("tripController updateDayForm: " + error);
        return res.redirect("/displayTrip");
      }
    },
    async updateDay(req, res) {
      try {
        if (
          req.body.title.trim() == "" ||
          req.body.description.trim() == "" ||
          req.body.location.trim() == ""
        ) {
          return res.json({ error: true });
        }
        let updateData = {
          title: req.body.title.trim().slice(0, 60),
          discription: req.body.description.trim().slice(0, 400),
          location: req.body.location.trim().slice(0, 30),
        };
        let result = await conn.query(
          `update trip_days set ? where id = ${req.query.did}`,
          updateData
        );
        return res.json({ error: false });
      } catch (error) {
        logger.error("tripController updateDay: " + error);
        return res.json({ error: true });
      }
    },
    async updateTrip(req, res) {
      try {
        const tid = req.query;
        const query = `select * from trip_details where trip_id='${req.query.tid}'`;
        let data = await conn.query(query);
        res.render("components/update/trips/updatetrip", { data: data });
      } catch (error) {
        logger.error("tripController updateTrip: " + error);
      }
    },

    async updateTripData(req, res) {
      try {
        const query = await conn.query(
          `UPDATE  trip_details SET  title=?, location=?, discription=?, trip_type_id=? WHERE trip_id=? `,
          [
            req.body.title,
            req.body.location,
            req.body.description,
            req.body.triptype,
            req.query.tid,
          ]
        );
        res.redirect("/displayTrip");
      } catch (error) {
        logger.log("tripController updateTripData: " + error);
        res.redirect("/error");
      }
    },
    async createvent(req, res) {
      try {
        let startTime = new Date(req.body.start_time);
        let endTime = new Date(req.body.end_time);
        const sql = `insert into trip_events  (trip_id,title,discription,image,start_time,end_time,created_by) values(?,?,?,?,?,?,?)`;
        const [inserData] = await conn.query(sql, [req.params.tid,req.body.title,req.body.description,req.file.path.split("/").slice(-2).join("/"),startTime.toISOString().slice(0,16),endTime.toISOString().slice(0,16),req.user.userId]);
        res.status(200);
        res.redirect(`/displayTrip/${req.params.tid}`);
      } catch (e) {
        res.status(500);
        logger.error("trip controller createevent: " + e);
        return res.redirect("/error");
      }
    },

    async searchTrip(req, res) {
      try {
        const sql = `select trip_details.title from trip_members join trip_details on trip_details.trip_id = trip_members.trip_id where trip_members.user_id = ?  and trip_details.title like ?'%' and trip_members.deleted_at is NULL  and trip_details.deleted_at is NULL`;
        const [result] = await conn.query(sql, [
          req.body.userId,
          req.body.title,
        ]);
      } catch (error) {
        logger.error("tripController search Trip function:" + error.message);
      }
    },
    async updateeventtrip(req, res) {
      try {
        const eventId = req.query.eid;
        let startTime = new Date(req.body.start_time);
        let endTime = new Date(req.body.end_time);
        let tripeventUpdateData = {
          title: req.body.title,
          discription: req.body.description,
          start_time: startTime.toISOString().slice(0,16),
          end_time: endTime.toISOString().slice(0,16),
        };
        if (req.file?.path) {
          tripeventUpdateData["image"] = req.file.path
            .split("/")
            .slice(-2)
            .join("/");
        }
        const sql = `update   trip_events  set ? where id = ? `;
        const [inserData] = await conn.query(sql, [
          tripeventUpdateData,
          eventId,
        ]);

        if (inserData.affectedRows) {
          res.status(200);
          return res.redirect(`/displayTrip/${req.query.tid}`);
        } else {
          res.status(500);
        }
      } catch (e) {
        logger.error("trip controller updateeventTrip: " + e);
        return res.redirect("/error");
      }
    },
    async getCreateEventForm(req, res) {
      try {
        let tripId = req.params.tid;
        let [result] = await conn.query(
          `select trip_id,start_date,end_date from trip_details where trip_id = ?`,
          [tripId]
        );
        res.render("components/create/trips/createEvent", {
          tripData: result[0],
          eventData: {},
          route: `/trips/eventcreate/${tripId}`,
        });
      } catch (error) {
        let tripId = req.params.tid;
        logger.error("getCreateEventForm,", error);
        res.redirect(`/displayTrip/${tripId}`);
      }
    },
    async fetchTripEventDetails(req, res) {
      try {
        const eventId = req.query.eid;
        const tripId = req.query.tid;
        let [result] = await conn.query(
          `select trip_id,start_date,end_date from trip_details where trip_id = ?`,
          [tripId]
        );
        let sql = `select *  from trip_events where id = ? and trip_id = ? and deleted_at is null;`;
        let [data] = await conn.query(sql, [eventId, tripId]);

        let offset = new Date().getTimezoneOffset();
        data[0].start_time = new Date(data[0].start_time).getTime();
        data[0].start_time -= offset * 60 * 1000;
        data[0].start_time = new Date(data[0].start_time);

        data[0].end_time = new Date(data[0].end_time).getTime();
        data[0].end_time -= offset * 60 * 1000;
        data[0].end_time = new Date(data[0].end_time);

        res.status(200);
        res.render("components/create/trips/createEvent", {
          tripData: result[0],
          eventData: data[0],
          route: `/trips/eventupdate?tid=${tripId}&eid=${eventId}`,
        });
      } catch (e) {
        const tripId = req.query.tid;
        logger.error("displayTrip controller fetchTripEventDetails : " + e);
        return res.redirect(`/displayTrip/${tripId}`);
      }
    },
    async deleteTripEvent(req, res) {
      try {
        let [result] = await conn.query(
          "update trip_events set deleted_at = CURRENT_TIMESTAMP where id = ?",
          [req.query.eid]
        );
        if (result.affectedRows) {
          return res.json({ error: false });
        } else {
          return res.json({ error: true });
        }
      } catch (error) {
        logger.error("delete trip event: ", error);
        return res.json({ error: true });
      }
    },
  };
};

module.exports = tripinsert;
