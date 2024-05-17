const winston = require("winston");
const { combine, timestamp, json, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: "silly",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }),
  ],
});

module.exports = logger;
