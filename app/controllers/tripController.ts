import conn from "../config/mysql_connection";
import logger from "../config/logger";
import { Request, Response } from "express";
import { QueryResult, ResultSetHeader } from "mysql2";
import { UserId } from "../../index";
import {
  newUser,
  locationInterface,
  tripEventDetail,
  tripeventUpdateDataInterface,
  allTripDetails,
  userlist,
  useProfileDetail,
  tripDetailsInterface,
  datesSDED,
  idList,
  tripIdList,
  editMembers,
  idDetails,
} from "../../dto/tripControllerinterface";
import { UnknownFieldMessageFactory } from "express-validator";
import { Socket } from "socket.io";

const tripinsert = () => {
  return {
    async fetchmembers(req: Request, res: Response) {
      try {
        const result = await conn.query(`SELECT userName from user_profiles;`);
        res.json({ result: result[0] });
      } catch (error) {
        logger.error("tripController fetchmembers: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
    async tripDetails(req: Request, res: Response) {
      try {
        let data = {
          user_id: (req.user as UserId).userId,
          title: req.body.title,
          discription: req.body.description,
          start_date: req.body.startdate,
          end_date: req.body.enddate,
          trip_type_id: req.body.triptype,
          cover_image: (req.user as UserId).userId + "/" + req.file?.filename,
          location: req.body.location,
        };
        const insert = await conn.query<ResultSetHeader>(
          `INSERT INTO trip_details SET ?;`,
          data
        );
        let trip_id = insert[0].insertId;

        // Trip Members Add..
        const result = await conn.query(
          `INSERT INTO trip_members(trip_id,user_id)
                values('${trip_id}','${(req.user as UserId).userId}')`
        );
        if (req.body.members) {
          req.body.members.forEach(async (data: string) => {
            try {
              const userId: Array<userlist> = (await conn.query<QueryResult>(
                `SELECT user_id FROM user_profiles  WHERE userName = "${data}"`
              )) as unknown as Array<userlist>;
              if (userId.length == 1) {
                let members = {
                  trip_id: trip_id,
                  user_id: userId[0].user_id,
                };
                const data = await conn.query(
                  `INSERT INTO trip_members SET ?`,
                  members
                );

                let objectNotificationTrip = {
                  trip_id: trip_id,
                  create_user_id: (req.user as UserId).userId,
                  add_user_id: userId[0].user_id,
                };
                const insertNotification = await conn.query(
                  `INSERT INTO notification_trip set ?
                  `,
                  objectNotificationTrip
                );
                let trip_details: Array<tripDetailsInterface> =
                  (await conn.query<QueryResult>(
                    `SELECT * FROM trip_details where trip_id=?`,
                    trip_id
                  )) as unknown as Array<tripDetailsInterface>;
                let userDetail: Array<useProfileDetail> =
                  (await conn.query<QueryResult>(
                    `SELECT * FROM user_profiles where user_id=1;`,
                    (req.user as UserId).userId
                  )) as unknown as Array<useProfileDetail>;
                let io = req.app.get("socketio");
                io.on("connection", (socket: Socket) => {
                  socket.broadcast.emit(
                    `notification-like-${userId[0].user_id}`,
                    {
                      create_user_id: (req.user as UserId).userId,
                      profile_image: userDetail[0].profile_image,
                      username: userDetail[0].username,
                      name: userDetail[0].first_name + userDetail[0].last_name,
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

        if (!insert[0].insertId) {
          res.render;
          res.redirect("/displayTrip");
        }
      } catch (error) {
        res.redirect("/error");
        logger.error(error);
      }
    },

    async newMemberRemove(req: Request, res: Response) {
      try {
        const { userName, tripId } = req.body;
        const newuser = userName.trim();
        let sql = `select user_id  from user_profiles where username = ?`;
        const result: Array<newUser> = (await conn.query<QueryResult>(sql, [
          newuser,
        ])) as unknown as Array<newUser>;
        const deletedId = result[0].user_id;
        const deleterId = (req.user as UserId).userId;
        sql = `update trip_members set deleted_at = current_timestamp() , deleted_by = ? where user_id = ? and trip_id = ?;`;
        await conn.query(sql, [deleterId, deletedId, tripId]);
        res.status(200).json({ message: "Member removed successfully" });
      } catch (error) {
        logger.error("tripController newMemberRemove: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async dayByDay(req: Request, res: Response) {
      try {
        let userId = (req.user as UserId).userId;
        let tid = req.params.tid;
        const repeatDates = await conn.query(
          `select dates from trip_days where trip_id=${tid} and deleted_at is NULL;`
        );

        const dates: Array<datesSDED> = (await conn.query<QueryResult>(
          `SELECT start_date as sd,end_date as ed from trip_details where trip_id='${tid}';`
        )) as unknown as Array<datesSDED>;
        const startDate = dates[0].sd;
        const endDate = dates[0].ed;
        const sql =
          "select  trip_details.trip_id from trip_members join trip_details on trip_details.trip_id = trip_members.trip_id where trip_members.user_id = ?";
        let result: Array<tripIdList> = (await conn.query<QueryResult>(
          sql,
          userId
        )) as unknown as Array<tripIdList>;
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

    async getLocation(req: Request, res: Response) {
      try {
        let locationNames: string[] = [];
        const result2: Array<locationInterface> =
          (await conn.query<QueryResult>(
            `select distinct(location) from trip_post_location where location like "${req.body.locationLike}%"`
          )) as unknown as Array<locationInterface>;

        result2.forEach((item: { location: string }) => {
          locationNames.push(item.location);
        });
        return res.json(locationNames);
      } catch (error) {
        logger.error("tripController getLocation: " + error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async removeImage(req: Request, res: Response) {
      try {
        const deleterId = req.body.deleterId;
        const imageName = req.body.imageName;
        const sql = `update trip_images set deleted_at = current_timestamp() , deleted_by = ? where image = ?`;
        await conn.query(sql, [deleterId, imageName]);
        res.status(200).json({ message: "Image removed successfully" });
      } catch (error) {
        logger.error("tripController removeImage: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async addImage(req: Request, res: Response) {
      try {
        const tid = req.body.tid;
        const did = req.body.did;
        const files = req.files || [];
        if (!files.length) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Use the file object here

        for (let i = 0; i < files.length; i++) {
          let dayphotos: any = {};
          if (
            files[i].mimetype == "image/png" ||
            files[i].mimetype == "image/jpeg" ||
            files[i].mimetype == "image/jpg"
          ) {
            dayphotos = {
              image: req.body.tid + "/" + files[i].filename,
              day_id: req.body.did,
              is_video: "0",
            };
            await conn.query(`INSERT INTO trip_images SET ?`, dayphotos);
          } else {
            dayphotos = {
              image: req.body.tid + "/" + files[i].filename,
              day_id: req.body.did,
              is_video: "1",
            };
            await conn.query(`INSERT INTO trip_images SET ?`, dayphotos);
          }
        }

        res.redirect(`/displayTrip/images/${tid}/${did}`);
      } catch (error) {
        logger.error("tripController addImage: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async removeTrip(req: Request, res: Response) {
      try {
        const { tripId, deleterId } = req.body;
        const sql = `update trip_details set deleted_at = current_timestamp() , deleted_by = ? where trip_id = ?`;
        await conn.query(sql, [deleterId, tripId]);
        res.status(200).json({ message: "Trip removed successfully" });
      } catch (error) {
        logger.error("trip controller remove trip function: ", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async leaveTrip(req: Request, res: Response) {
      try {
        const { tripId, deleterId } = req.body;
        const sql = `update trip_members set deleted_at = current_timestamp() , deleted_by = ? where trip_id = ? and user_id = ?`;
        await conn.query(sql, [deleterId, tripId, deleterId]);
        res.status(200).json({ message: "Left trip successfully" });
      } catch (error) {
        logger.error("trip controller leaveTrip function: ", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async deleteTripDay(req: Request, res: Response) {
      try {
        await conn.beginTransaction();
        let result = await conn.query(
          "update trip_days set deleted_at = CURRENT_TIMESTAMP,deleted_by = ? where id = ?",
          [(req.user as UserId).userId, req.query.did]
        );
        result = await conn.query(
          "update trip_images set  deleted_by = ?,deleted_at = CURRENT_TIMESTAMP  where day_id = ?",
          [(req.user as UserId).userId, req.query.did]
        );
        await conn.commit();
        return res
          .status(200)
          .json({ message: "Trip day deleted successfully" });
      } catch (error) {
        logger.error("tripcontroller deleteTripDay: " + error);
        await conn.rollback();
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },
    async updateDayForm(req: Request, res: Response) {
      try {
        const result = await conn.query<QueryResult>(
          "select id,title,discription,location from trip_days where id = ?",
          [req.query.did]
        );
        return res.render("components/create/trips/updateDay", {
          data: result[0],
        });
      } catch (error) {
        logger.error("tripController updateDayForm: " + error);
        return res.redirect("/displayTrip");
      }
    },
    createTrip(req: Request, res: Response) {
      res.render("components/create/trips/createtrip");
    },
    async updateDay(req: Request, res: Response) {
      try {
        if (
          req.body.title.trim() == "" ||
          req.body.description.trim() == "" ||
          req.body.location.trim() == ""
        ) {
          return res.status(400).json({ error: "Invalid input data" });
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
        return res
          .status(200)
          .json({ message: "Trip day updated successfully" });
      } catch (error) {
        logger.error("tripController updateDay: " + error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },
    async updateTrip(req: Request, res: Response) {
      try {
        const tid = req.query;
        const query = `select * from trip_details where trip_id='${req.query.tid}'`;
        let data = await conn.query(query);
        res.render("components/update/trips/updatetrip", { data: data });
      } catch (error) {
        logger.error("tripController updateTrip: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async updateTripData(req: Request, res: Response) {
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
        logger.error("tripController updateTripData: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
    async createvent(req: Request, res: Response) {
      try {
        let startTime = new Date(req.body.start_time);
        let endTime = new Date(req.body.end_time);
        const sql = `insert into trip_events  (trip_id,title,discription,image,start_time,end_time,created_by) values(?,?,?,?,?,?,?)`;
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        await conn.query(sql, [
          req.params.tid,
          req.body.title,
          req.body.description,
          req.file.path.split("/").slice(-2).join("/"),
          startTime.toISOString().slice(0, 16),
          endTime.toISOString().slice(0, 16),
          (req.user as UserId).userId,
        ]);
        res.status(200);
        res.redirect(`/displayTrip/${req.params.tid}`);
      } catch (e) {
        logger.error("trip controller createevent: " + e);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async searchTrip(req: Request, res: Response) {
      try {
        const sql = `select trip_details.title from trip_members join trip_details on trip_details.trip_id = trip_members.trip_id where trip_members.user_id = ?  and trip_details.title like ?'%' and trip_members.deleted_at is NULL  and trip_details.deleted_at is NULL`;
        const [result] = await conn.query(sql, [
          req.body.userId,
          req.body.title,
        ]);
        res.status(200).json({ result });
      } catch (error) {
        logger.error("tripController search Trip function:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
    async updateeventtrip(req: Request, res: Response) {
      try {
        const eventId = req.query.eid;
        let startTime = new Date(req.body.start_time);
        let endTime = new Date(req.body.end_time);
        let tripeventUpdateData: tripeventUpdateDataInterface = {
          title: req.body.title,
          discription: req.body.description,
          start_time: startTime.toISOString().slice(0, 16),
          end_time: endTime.toISOString().slice(0, 16),
        };
        if (req.file?.path) {
          tripeventUpdateData.image = req.file.path
            .split("/")
            .slice(-2)
            .join("/");
        }
        const sql = `update   trip_events  set ? where id = ? `;
        const inserData = await conn.query<ResultSetHeader>(sql, [
          tripeventUpdateData,
          eventId,
        ]);

        if (inserData[0].affectedRows) {
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
    async getCreateEventForm(req: Request, res: Response) {
      try {
        let tripId = req.params.tid;
        let result = await conn.query<QueryResult>(
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
    async fetchTripEventDetails(req: Request, res: Response) {
      try {
        const eventId = req.query.eid;
        const tripId = req.query.tid;
        let result: Array<tripEventDetail> = (await conn.query(
          `select trip_id,start_date,end_date from trip_details where trip_id = ?`,
          [tripId]
        )) as unknown as Array<tripEventDetail>;
        let sql = `select *  from trip_events where id = ? and trip_id = ? and deleted_at is null;`;
        let data: Array<allTripDetails> = (await conn.query<QueryResult>(sql, [
          eventId,
          tripId,
        ])) as unknown as Array<allTripDetails>;

        let offset = new Date().getTimezoneOffset();
        data[0].start_time = new Date(data[0].start_time).getTime();
        data[0].start_time -= offset * 60 * 1000;
        data[0].start_time = new Date(data[0].start_time) as unknown as number;

        data[0].end_time = new Date(data[0].end_time).getTime();
        data[0].end_time -= offset * 60 * 1000;
        data[0].end_time = new Date(data[0].end_time) as unknown as number;

        res.status(200);
        res.render("components/create/trips/createEvent", {
          tripData: result[0],
          eventData: data[0],
          route: `/trips/updateevent/${tripId}?eid=${eventId}`,
        });
      } catch (error) {
        logger.error("fetchTripEventDetails: " + error);
        return res.redirect("/error");
      }
    },
    async deleteEvent(req: Request, res: Response) {
      try {
        const sql = `update trip_events set deleted_at = current_timestamp() , deleted_by = ? where id = ?`;
        await conn.query(sql, [(req.user as UserId).userId, req.query.eid]);
        return res.status(200).json({ message: "Event deleted successfully" });
      } catch (error) {
        logger.error("deleteEvent: " + error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async daybydayinsert(req: Request, res: Response) {
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
            let dayId: Array<idList> = (await conn.query<QueryResult>(
              `SELECT id from trip_days where trip_id=? and dates=? and deleted_at is NULL`,
              [req.body.tid, req.body.date]
            )) as unknown as Array<idList>;

            let dayphotos = {
              image: req.body.tid + "/" + req.files[i].filename,
              day_id: dayId[0].id,
            };
            const videoType = ["mp4", "webm"];
            const fileMany: string = req.files[i].filename as string;
            const result: string = fileMany.split(".").pop() as string;
            if (videoType.includes(result)) {
              const sql = `INSERT INTO trip_images(image,day_id,is_video) values(?,?,?)`;
              const data1 = await conn.query(sql, [
                req.body.tid + "/" + req.files[i].filename,
                dayId[0].id,
                1,
              ]);
            } else {
              const sql = `INSERT INTO trip_images(image,day_id,is_video) values(?,?,?)`;
              const data1 = await conn.query(sql, [
                req.body.tid + "/" + req.files[i].filename,
                dayId[0].id,
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

    async editmembers(req: Request, res: Response) {
      try {
        const userId = (req.user as UserId).userId;
        const tripId = req.params.tid;
        let sql = `select profile_image , username , user_profiles.user_id , trip_members.trip_id from trip_members join user_profiles on user_profiles.user_id = trip_members.user_id where trip_id = ? and trip_members.user_id != ? and deleted_at is NULL;`;
        const result: Array<editMembers> = (await conn.query<QueryResult>(sql, [
          tripId,
          userId,
        ])) as unknown as Array<editMembers>;

        if (result.length == 0) {
          sql = `select trip_members.user_id , trip_members.trip_id from trip_members join user_profiles on user_profiles.user_id = trip_members.user_id where trip_id = ? and deleted_at is NULL  and trip_members.user_id = ?`;
          const result1: Array<idDetails> = (await conn.query(sql, [
            tripId,
            userId,
          ])) as unknown as Array<idDetails>;
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

    async editMembersPost(req: Request, res: Response) {
      try {
        const { deleterId, deletedId, tripId } = req.body;
        const sql = `update trip_members set deleted_at = current_timestamp() , deleted_by = ? where user_id = ? and trip_id = ?;`;
        await conn.query(sql, [deleterId, deletedId, tripId]);
      } catch (error) {
        logger.error("tripController editMembersPost: " + error);
      }
    },

    async addMembersPost(req: Request, res: Response) {
      try {
        const { userName, tripId } = req.body;
        let sql = `select user_id from user_profiles where username = ? `;
        const result: Array<userlist> = (await conn.query(sql, [
          userName,
        ])) as unknown as Array<userlist>;
        let data = { trip_id: tripId, user_id: result[0].user_id };
        sql = `insert into trip_members SET ? `;
        const [result1] = await conn.query(sql, data);

        let objectNotificationTrip = {
          trip_id: tripId,
          create_user_id: (req.user as UserId).userId,
          add_user_id: result[0].user_id,
        };
        let insertNotification = await conn.query(
          `INSERT INTO notification_trip set ?
          `,
          objectNotificationTrip
        );

        let trip_details: Array<tripDetailsInterface> = (await conn.query(
          `SELECT * FROM trip_details where trip_id=?`,
          tripId
        )) as unknown as Array<tripDetailsInterface>;
        let userDetail: Array<useProfileDetail> =
          (await conn.query<QueryResult>(
            `SELECT * FROM user_profiles where user_id=1;`,
            (req.user as UserId).userId
          )) as unknown as Array<useProfileDetail>;

        res.json({
          id: result[0].user_id,
          data: {
            create_user_id: (req.user as UserId).userId,
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
    async deleteTripEvent(req: Request, res: Response) {
      try {
        let [result] = await conn.query<ResultSetHeader>(
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

export default tripinsert;
