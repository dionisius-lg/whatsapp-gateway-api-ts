import moment from "moment-timezone";
import morgan from "morgan";
import winston from "winston";
import "winston-daily-rotate-file";
import { createStream } from "rotating-file-stream";
import { dirname, resolve } from "path";
import config from "./../config";
import { isEmpty } from "./value";

const { timezone } = config;

moment.tz.setDefault(timezone);

interface LogOptions {
    status?: string;
    from: string;
    message: string;
    result?: any;
}

export const access = (app: any) => {
    const name = (time?: number | Date) => {
        if (time) {
            return ['access', moment(time).format('YYYY-MM-DD'), '.log'].join('-');
        }

        return 'access.log';
    };

    const stream = createStream((time) => name(time), {
        // rotate daily
        interval: '1d',
        path: resolve(dirname(require.main?.filename ?? __dirname), 'logs/access')
    });

    morgan.token('body', (req: any) => {
        return req.body ? JSON.stringify(req.body) : '';
    });

    morgan.token('date', () => {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    });

    morgan.token('secret', (req: any) => {
        return req.headers && req.headers['x-api-key'];
    });

    app.use(morgan(':remote-addr :remote-user [:date] :status [secret=:secret] ":method :url HTTP/:http-version" :body :response-time ms - :res[content-length] ', { stream }));
};

export const success = ({ from = 'server', message = '', result = null }: LogOptions) => {
    const transport = new winston.transports.DailyRotateFile({
        filename: resolve(dirname(require.main?.filename ?? __dirname), 'logs/success/success-%DATE%.log'),
        datePattern: 'YYYY-MM-DD'
    });

    const logger = winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf((info: winston.Logform.TransformableInfo) => `${info.timestamp} ${JSON.stringify(info.message.log)}`)
        ),
        transports: [new winston.transports.Console(), transport]
    });

    let log: LogOptions = { status: 'success', from, message };

    if (!isEmpty(result)) {
        log.result = result;
    }

    return logger.info({ log });
};

export const error = ({ from = 'server', message = '', result = null }: LogOptions) => {
    const transport = new winston.transports.DailyRotateFile({
        filename: resolve(dirname(require.main?.filename ?? __dirname), 'logs/error/error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD'
    });

    const logger = winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf((error: winston.Logform.TransformableInfo) => `${error.timestamp} ${JSON.stringify(error.message.log)}`)
        ),
        transports: [new winston.transports.Console(), transport]
    });

    let log: LogOptions = { status: 'error', from, message };

    if (!isEmpty(result)) {
        log.result = result;
    }

    return logger.error({ log });
};