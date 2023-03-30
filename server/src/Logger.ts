
import path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';


export const logger = winston.createLogger({
    silent: true
});

export function initializeLogger(level: string, directory: string) {
    if (level !== 'none') {
        if (process.env.NODE_ENV === 'production') {
            logger.silent = false;
            logger.add(new winston.transports.DailyRotateFile({
                level: level,
                filename: path.join(directory, '%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '30d',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json(),
                )
            }));
        } else if (process.env.NODE_ENV !== 'production') {
            logger.silent = false;
            logger.add(new winston.transports.Console({
                level: level,
                silent: false,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.colorize(),
                    winston.format.simple(),
                )
            }));
        }
    }
}