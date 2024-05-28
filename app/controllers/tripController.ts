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
  tripInfo,
  memberInfo,
  notificationTripinfo,
  updateDataInfo,
  daybydayInfo,
} from "../../dto/ tripControllerinterface";
import { UnknownFieldMessageFactory } from "express-validator";
import { Socket } from "socket.io";
import { dataSet, insertSet, UpdateSet } from '../../dto/commonInterface';

const tripinsert = () => {
  return {
    async fetchmembers(req: Request, res: Response) {
      try {
        const result: dataSet = await conn.query(
          `SELECT userName from user_profiles;`
        );
        res.json({ result: result[0] });
      } catch (error) {
        logger.error("tripController fetchmembers: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
    async tripDetails(req: Request, res: Response) {
      try {
        let data: tripInfo = {
          user_id: (req.user as UserId).userId.toString(),
          title: req.body.title,
          discription: req.body.description,
          start_date: req.body.startdate,
          end_date: req.body.enddate,
          trip_type_id: req.body.triptype,
          cover_image: (req.user as UserId).userId + "/" + req.file?.filename,
          location: req.body.location,
        };
        const insert: insertSet = await conn.query<ResultSetHeader>(
          `INSERT INTO trip_details SET ?;`,
          data
        );
        let trip_id = insert[0].insertId;

        // Trip Members Add..
        await conn.query(
          `INSERT INTO trip_members(trip_id,user_id)
                values('${trip_id}','${(req.user as UserId).userId}')`
        );
        if (req.body.members) {
          req.body.members.forEach(async (data: string) => {
            try {
              const userId: dataSet = await conn.query(
                `SELECT user_id FROM user_profiles  WHERE userName = "${data}"`
              );

              const useridDetails: userlist[] = userId[0] as userlist[];

              if (useridDetails.length == 1) {
                let members: memberInfo = {
                  trip_id: trip_id,
                  user_id: useridDetails[0].user_id,
                };
                await conn.query(`INSERT INTO trip_members SET ?`, members);

                let objectNotificationTrip: notificationTripinfo = {
                  trip_id: trip_id,
                  create_user_id: (req.user as UserId).userId,
                  add_user_id: useridDetails[0].user_id,
                };
                await conn.query(
                  `INSERT INTO notification_trip set ?
                  `,
                  objectNotificationTrip
                );
                let trip_details: dataSet = await conn.query(
                  `SELECT * FROM trip_details where trip_id=?`,
                  trip_id
                );

                const trip_Details: tripDetailsInterface[] =
                  trip_details[0] as tripDetailsInterface[];

                // tripDetailsInterface
                let userDetail: dataSet = await conn.query(
                  `SELECT * FROM user_profiles where user_id=1;`,
                  (req.user as UserId).userId
                );
                const userProfileDetails: useProfileDetail[] =
                  userDetail[0] as useProfileDetail[];

                // useProfileDetail
                let io = req.app.get("socketio");
                io.on("connection", (socket: Socket) => {
                  socket.broadcast.emit(
                    `notification-like-${useridDetails[0].user_id}`,
                    {
                      create_user_id: (req.user as UserId).userId,
                      profile_image: userProfileDetails[0].profile_image,
                      username: userProfileDetails[0].username,
                      name:
                        userProfileDetails[0].first_name +
                        userProfileDetails[0].last_name,
                      cover_image: trip_Details[0].cover_image,
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
        const newuser: string = userName.trim();
        let sql: string = `select user_id  from user_profiles where username = ?`;
        const result: dataSet = await conn.query<QueryResult>(sql, [newuser]);

        const useridDetails: newUser[] = result[0] as newUser[];

        const deletedId: string = useridDetails[0].user_id;
        const deleterId: string = (req.user as UserId).userId;
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
        let userId: string = (req.user as UserId).userId;
        let tid: string = req.params.tid;
        const repeatDates = await conn.query(
          `select dates from trip_days where trip_id=${tid} and deleted_at is NULL;`
        );

        const dates: dataSet = await conn.query<QueryResult>(
          `SELECT start_date as sd,end_date as ed from trip_details where trip_id='${tid}';`
        );

        const datesDetails: datesSDED[] = dates[0] as datesSDED[];

        const sql: string =
          "select  trip_details.trip_id from trip_members join trip_details on trip_details.trip_id = trip_members.trip_id where trip_members.user_id = ?";
        let result: dataSet = await conn.query(sql, userId);

        const tDetails: tripIdList[] = result[0] as tripIdList[];

        if (tDetails.length > 0) {
          for (let i = 0; i < result.length; i++) {
            if (tDetails[i].trip_id == tid) {
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
        const result2: dataSet = await conn.query(
          `select distinct(location) from trip_post_location where location like "${req.body.locationLike}%"`
        );
        const tripPostDetails: locationInterface[] =
          result2[0] as locationInterface[];

        // locationInterface

        tripPostDetails.forEach((item: { location: string }) => {
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
        const deleterId: string = req.body.deleterId;
        const imageName: string = req.body.imageName;
        const sql: string = `update trip_images set deleted_at = current_timestamp() , deleted_by = ? where image = ?`;
        await conn.query(sql, [deleterId, imageName]);
        res.status(200).json({ message: "Image removed successfully" });
      } catch (error) {
        logger.error("tripController removeImage: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async addImage(req: Request, res: Response) {
      try {
        const tid: string = req.body.tid;
        const did: string = req.body.did;
        const files = req.files || [];
        if (!files.length) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Use the file object here

        for (let i: number = 0; i < files.length; i++) {
          let dayphotos = {};
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
        const sql: string = `update trip_details set deleted_at = current_timestamp() , deleted_by = ? where trip_id = ?`;
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
        const sql: string = `update trip_members set deleted_at = current_timestamp() , deleted_by = ? where trip_id = ? and user_id = ?`;
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
        let result: UpdateSet = await conn.query(
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
        const result: dataSet = await conn.query<QueryResult>(
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
        let updateData: updateDataInfo = {
          title: req.body.title.trim().slice(0, 60),
          discription: req.body.description.trim().slice(0, 400),
          location: req.body.location.trim().slice(0, 30),
        };
        await conn.query(
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
        const query: string = `select * from trip_details where trip_id='${req.query.tid}'`;
        let data: dataSet = await conn.query(query);
        res.render("components/update/trips/updatetrip", { data: data[0] });
      } catch (error) {
        logger.error("tripController updateTrip: " + error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async updateTripData(req: Request, res: Response) {
      try {
        const query: UpdateSet = await conn.query(
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
        let startTime: Date = new Date(req.body.start_time);
        let endTime: Date = new Date(req.body.end_time);
        const sql: string = `insert into trip_events  (trip_id,title,discription,image,start_time,end_time,created_by) values(?,?,?,?,?,?,?)`;
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
        const sql: string = `select trip_details.title from trip_members join trip_details on trip_details.trip_id = trip_members.trip_id where trip_members.user_id = ?  and trip_details.title like ?'%' and trip_members.deleted_at is NULL  and trip_details.deleted_at is NULL`;
        const result: dataSet = await conn.query(sql, [
          req.body.userId,
          req.body.title,
        ]);
        res.status(200).json({ result: result[0] });
      } catch (error) {
        logger.error("tripController search Trip function:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    },
    async updateeventtrip(req: Request, res: Response) {
      try {
        const eventId: string = req.query.eid as string;
        let startTime: Date = new Date(req.body.start_time);
        let endTime: Date = new Date(req.body.end_time);
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
        const sql: string = `update   trip_events  set ? where id = ? `;
        const inserData: UpdateSet = await conn.query<ResultSetHeader>(sql, [
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
        let tripId: string = req.params.tid;
        let result: dataSet = await conn.query<QueryResult>(
          `select trip_id,start_date,end_date from trip_details where trip_id = ?`,
          [tripId]
        );
        res.render("components/create/trips/createEvent", {
          tripData: result[0],
          eventData: {},
          route: `/trips/eventcreate/${tripId}`,
        });
      } catch (error) {
        let tripId: string = req.params.tid;
        logger.error("getCreateEventForm,", error);
        res.redirect(`/displayTrip/${tripId}`);
      }
    },
    async fetchTripEventDetails(req: Request, res: Response) {
      try {
        const eventId: string = req.query.eid as string;
        const tripId: string = req.query.tid as string;
        let result: dataSet = await conn.query(
          `select trip_id,start_date,end_date from trip_details where trip_id = ?`,
          [tripId]
        );
        let sql: string = `select *  from trip_events where id = ? and trip_id = ? and deleted_at is null;`;
        let data: dataSet = await conn.query(sql, [eventId, tripId]);

        const eventDetails: allTripDetails[] = data[0] as allTripDetails[];

        // allTripDetails

        let offset = new Date().getTimezoneOffset();
        eventDetails[0].start_time = new Date(
          eventDetails[0].start_time
        ).getTime();
        eventDetails[0].start_time -= offset * 60 * 1000;
        eventDetails[0].start_time = Number(
          new Date(eventDetails[0].start_time)
        );

        eventDetails[0].end_time = new Date(eventDetails[0].end_time).getTime();
        eventDetails[0].end_time -= offset * 60 * 1000;
        eventDetails[0].end_time = Number(new Date(eventDetails[0].end_time));

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
        const sql: string = `update trip_events set deleted_at = current_timestamp() , deleted_by = ? where id = ?`;
        await conn.query(sql, [(req.user as UserId).userId, req.query.eid]);
        return res.status(200).json({ message: "Event deleted successfully" });
      } catch (error) {
        logger.error("deleteEvent: " + error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    },

    async daybydayinsert(req: Request, res: Response) {
      try {
        let data: daybydayInfo = {
          trip_id: req.body.tid,
          discription: req.body.description,
          title: req.body.title,
          location: req.body.location,
          dates: req.body.date,
        };

        // Day by Day insertion

        const result: insertSet = await conn.query(
          `INSERT INTO trip_days  SET ?;`,
          data
        );

        if (req.files) {
          for (let i: number = 0; i < req.files.length; i++) {
            let dayId: dataSet = await conn.query(
              `SELECT id from trip_days where trip_id=? and dates=? and deleted_at is NULL`,
              [req.body.tid, req.body.date]
            );

            // idList
            const idDetails: idList[] = dayId[0] as idList[];

            let dayphotos = {
              image: req.body.tid + "/" + req.files[i].filename,
              day_id: idDetails[0].id,
            };
            const videoType: string[] = ["mp4", "webm"];
            const fileMany: string = req.files[i].filename as string;
            const result: string = fileMany.split(".").pop() as string;
            if (videoType.includes(result)) {
              const sql: string = `INSERT INTO trip_images(image,day_id,is_video) values(?,?,?)`;
              const data1: insertSet = await conn.query(sql, [
                req.body.tid + "/" + req.files[i].filename,
                idDetails[0].id,
                1,
              ]);
            } else {
              const sql: string = `INSERT INTO trip_images(image,day_id,is_video) values(?,?,?)`;
              const data1: insertSet = await conn.query(sql, [
                req.body.tid + "/" + req.files[i].filename,
                idDetails[0].id,
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
        const userId: string = (req.user as UserId).userId;
        const tripId: string = req.params.tid;
        let sql: string = `select profile_image , username , user_profiles.user_id , trip_members.trip_id from trip_members join user_profiles on user_profiles.user_id = trip_members.user_id where trip_id = ? and trip_members.user_id != ? and deleted_at is NULL;`;
        const result: dataSet = await conn.query(sql, [tripId, userId]);

        // editMembers
        const profileDetails: editMembers[] = result[0] as editMembers[];

        if (profileDetails.length == 0) {
          sql = `select trip_members.user_id , trip_members.trip_id from trip_members join user_profiles on user_profiles.user_id = trip_members.user_id where trip_id = ? and deleted_at is NULL  and trip_members.user_id = ?`;
          const result1: dataSet = await conn.query(sql, [tripId, userId]);
          const memberDetails: idDetails[] = result1[0] as idDetails[];

          // idDetails
          if (memberDetails.length == 1) {
            res.render("components/create/trips/addmember", {
              data: memberDetails,
              userId,
              numberOfMember: "zero",
            });
          }
        } else if (profileDetails.length > 0) {
          res.render("components/create/trips/addmember", {
            data: profileDetails,
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
        const sql: string = `update trip_members set deleted_at = current_timestamp() , deleted_by = ? where user_id = ? and trip_id = ?;`;
        await conn.query(sql, [deleterId, deletedId, tripId]);
      } catch (error) {
        logger.error("tripController editMembersPost: " + error);
      }
    },

    async addMembersPost(req: Request, res: Response) {
      try {
        const { userName, tripId } = req.body;
        let sql: string = `select user_id from user_profiles where username = ? `;
        const result: dataSet = await conn.query(sql, [userName]);

        // userlist
        const uidDetails: userlist[] = result[0] as userlist[];

        let data: { trip_id: string; user_id: number } = {
          trip_id: tripId,
          user_id: uidDetails[0].user_id,
        };
        sql = `insert into trip_members SET ? `;
        const result1: insertSet = await conn.query(sql, data);

        let objectNotificationTrip = {
          trip_id: tripId,
          create_user_id: (req.user as UserId).userId,
          add_user_id: uidDetails[0].user_id,
        };
        await conn.query(
          `INSERT INTO notification_trip set ?
          `,
          objectNotificationTrip
        );

        let trip_details: dataSet = (await conn.query(
          `SELECT * FROM trip_details where trip_id=?`,
          tripId
        )) ;

        const tripDetails: tripDetailsInterface[] = result[0] as tripDetailsInterface[];

        // useProfileDetail
        let userDetail: dataSet=
          (await conn.query<QueryResult>(
            `SELECT * FROM user_profiles where user_id=1;`,
            (req.user as UserId).userId
          )) ;

          const upDetails: useProfileDetail[] = userDetail[0] as useProfileDetail[];

        res.json({
          id: uidDetails[0].user_id,
          data: {
            create_user_id: (req.user as UserId).userId,
            username: upDetails[0].username,
            name: upDetails[0].first_name + upDetails[0].last_name,
            profile_image: upDetails[0].profile_image,
            cover_image: tripDetails[0].cover_image,
          },
        });
      } catch (error) {
        logger.error("tripConroller addMembersPost: " + error);
      }
    },
    async deleteTripEvent(req: Request, res: Response) {
      try {
        let result:UpdateSet = await conn.query<ResultSetHeader>(
          "update trip_events set deleted_at = CURRENT_TIMESTAMP where id = ?",
          [req.query.eid]
        );
        if (result[0].affectedRows) {
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
