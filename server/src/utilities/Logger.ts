
import path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';


export const logger = winston.createLogger({
    silent: true
});

export function initializeLogger(level: string, directory: string) {
    if (level !== 'none') {
        logger.silent = false;

        // Always do a console logger
        logger.add(new winston.transports.Console({
            level: level,
            silent: false,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.simple(),
            )
        }));

        // ...but only do a file logger in prod
        if (process.env.NODE_ENV === 'production') {
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
        }
    }
}