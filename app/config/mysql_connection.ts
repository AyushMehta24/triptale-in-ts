import mysql, { Connection } from "mysql2";

const connection = mysql
  .createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "final_triptale",
  })
  .promise();

export default connection;
