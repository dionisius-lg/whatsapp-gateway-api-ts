import redis, { Redis, RedisOptions } from "ioredis";
import * as _ from "lodash";
import config from ".";

const { redis: { host, port, password, db, duration, service } } = config;

const option: RedisOptions = { host, port, db, enableOfflineQueue: true };
const channel: string = `__keyevent@${db}__:expired`;

if (!_.isEmpty(password)) {
    option.password = password;
}

let subscriber: Redis | false = false;
let client: Redis | any = null;
let connected = false;

if (service.toString() === '1') {
    subscriber = new Redis(option);
    client = new Redis(option);

    subscriber.subscribe(channel);

    client.on('ready', () => {
        console.log(`[redis] is ready`);
        client?.config('SET', 'notify-keyspace-events', 'Ex');
        connected = true;
    });

    client.on('connect', () => {
        console.log(`[redis] is connected`);
    });

    client.on('error', (err: Error) => {
        connected = false;
        console.error(`[redis] error: ${err?.message}`);
    });

    client.on('reconnecting', () => {
        connected = false;
        console.log(`[redis] reconnecting...`);
    });
}

export default {
    client,
    connected,
    duration
};