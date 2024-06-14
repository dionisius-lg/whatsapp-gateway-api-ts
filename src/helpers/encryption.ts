import { createCipheriv, createDecipheriv } from "crypto";
import config from "./../config";

const { secret } = config;

const algorithm = 'aes-256-cbc';
const key = Buffer.from(secret);
const iv = 'initVector16Bits';

export const encrypt = (value: string) => {
    const chiper = createCipheriv(algorithm, key, iv);
    return chiper.update(value, 'utf8', 'hex');
};

export const decrypt = (value: string) => {
    const dechiper = createDecipheriv(algorithm, key, iv);
    return dechiper.update(value, 'hex', 'utf8') + dechiper.final('utf8');
};