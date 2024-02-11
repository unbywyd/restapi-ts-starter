import { appConfig } from "@base/config/app";
import path from "path";
import winston from "winston";
import fs from "fs";
const logFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

const logsdir = path.join(appConfig.appPath, appConfig.logsDir);

const errorLogPath = path.join(logsdir, "error.log");
const combinedLogPath = path.join(logsdir, "combined.log");

if (!fs.existsSync(logsdir)) {
  fs.mkdirSync(logsdir);
}
if (!fs.existsSync(errorLogPath)) {
  fs.writeFileSync(errorLogPath, "");
}
if (!fs.existsSync(combinedLogPath)) {
  fs.writeFileSync(combinedLogPath, "");
}
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: errorLogPath, level: "error" }),
    new winston.transports.File({ filename: combinedLogPath }),
  ],
});

export default logger;
