import * as winston from "winston"
const { combine, colorize, splat, timestamp, printf } = winston.format
const customFormat = printf( ({ level, message, timestamp}) =>
  `${timestamp} [${level}] : ${message}`
);
export const log = winston.createLogger({
  format: combine(
    colorize(),
    splat(),
    timestamp(),
    customFormat,
  ),
  transports: [
    new winston.transports.Console()
  ]
})
