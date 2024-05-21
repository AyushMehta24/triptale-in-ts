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
} from "../../dto/ tripControllerinterface";
import { UnknownFieldMessageFactory } from "express-validator";

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
  };
};

export default tripinsert;
