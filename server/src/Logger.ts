
import path from 'path';
import * as winston from 'winston';

import { formatHyphenatedYYYYMMDD } from '../../common/utilities/DateUtils';


export const logger = winston.createLogger({
    silent: true
});

export function initializeLogger(level: string, directory: string) {
    if (level !== 'none') {
        if (process.env.NODE_ENV === 'production') {
            logger.silent = false;
            logger.add(new winston.transports.File({
                level: level,
                filename: path.join(directory, `${formatHyphenatedYYYYMMDD(new Date())}.log`),
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