import { isJson } from "./value";
import { createHash } from "crypto";
import * as _ from "lodash";
import redis from "./../config/redis";

interface Data {
    key: string;
}

interface SetExpire extends Data {
    expire: number;
}

interface GetData extends Data {
    field: string;
}

interface SetData extends Data {
    field: string;
    value: string | object | any[];
    expire?: number;
}

interface DeleteData extends Data {
    field?: string;
}

interface DeleteDataQuery {
    key: any[];
}

/**
 * Check redis key and field
 * @param key - redis key
 * @param field - redis field
 * @returns Promise<boolean> - Whether the field exists in the key or not
 */
export const checkData = async ({ key, field }: GetData): Promise<boolean> => {
    if (!redis.connected) {
        return false;
    }

    const { client } = redis;

    try {
        const result = await client.hexists(key, field);
        return result;
    } catch (err) {
        return false;
    }
    
};

/**
 * Set expire data to redis
 * @param key - redis key
 * @param expire - expire value (in seconds)
 */
export const setExpire = async ({ key, expire }: SetExpire) => {
    if (!redis.connected) {
        return false;
    }

    const { client } = redis;

    try {
        const result = await client.expire(key, expire);
        return result;
    } catch (err) {
        return false;
    }
};

/**
 * Get data from redis
 * @param key - redis key
 * @param field - redis field
 */
export const getData = async ({ key, field }: GetData) => {
    if (!redis.connected) {
        return false;
    }

    const { client } = redis;

    try {
        const result = await client.hmget(key, field);
        return result.trim();
    } catch (err) {
        return false;
    }
};

/**
 * Get data query result from redis
 * @param key - redis key
 * @param field - redis field
 */
export const getDataQuery = async ({ key, field }: GetData) => {
    if (!redis.connected) {
        return false;
    }

    const { client } = redis;
    const hashField: string = createHash('md5').update(field).digest('hex');

    try {
        let result = await client.hmget(key, hashField);
            result = result.trim();

        if (isJson(result)) {
            result = JSON.parse(result);
        }

        return result;
    } catch (err) {
        return false;
    }
};

/**
 * set data to redis
 * @param key - redis key
 * @param field - redis field
 * @param value - redis data
 * @param expire - expire value (in seconds)
 */
export const setData = async ({ key, field, value, expire }: SetData) => {
    if (!redis.connected) {
        return false;
    }

    const { client, duration } = redis;

    if (_.isObjectLike(value)) {
        value = JSON.stringify(value);
    }

    try {
        const result = await client.hset(key, field, value);

        switch (true) {
            case (expire && expire > 0):
                await setExpire({ key, expire });
                break;
            default:
                await setExpire({ key, expire: duration });
                break;
        }

        return result;
    } catch (err) {
        return false;
    }
};

/**
 * Set data query result to redis
 * @param key - redis key
 * @param field - redis field
 * @param data - redis data
 * @param expire - expire value (in seconds)
 */
export const setDataQuery = async ({ key, field, value, expire }: SetData) => {
    if (!redis.connected) {
        return false;
    }

    const { client, duration } = redis;
    const hashField: string = createHash('md5').update(field).digest('hex');

    if (_.isObjectLike(value)) {
        value = JSON.stringify(value);
    }

    try {
        const result = await client.hset(`query:${key}`, hashField, value);

        switch (true) {
            case (expire && expire > 0):
                await setExpire({ key: `query:${key}`, expire });
                break;
            default:
                await setExpire({ key: `query:${key}`, expire: duration });
                break;
        }

        return result;
    } catch (err) {
        return false;
    }
};

/**
 * Delete data from redis
 * @param key - redis key
 * @param field - redis field
 */
export const deleteData = async ({ key, field }: DeleteData) => {
    if (!redis.connected) {
        return false;
    }

    const { client } = redis;

    try {
        if (field) {
            await client.hdel(key, field);
            return key;
        }

        await client.del(key);
        return key;
    } catch (err) {
        return false;
    }
};

/**
 * Delete data from redis
 * @param key - redis key
 */
export const deleteDataQuery = async ({ key }: DeleteDataQuery) => {
    if (!redis.connected) {
        return false;
    }

    const { client } = redis;

    try {
        for (let i in key) {
            await client.del(`query:${key}`);
        }

        return key.length;
    } catch (err) {
        return false;
    }
};