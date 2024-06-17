import axios, { AxiosInstance } from "axios";
import * as logger from "./../helpers/logger";
import config from "./../config";

const { socket: { url, key } } = config;

const instance:  AxiosInstance = axios.create({
    baseURL: url,
    headers: { 'Accept': 'application/json', 'x-api-key': key }
});

const send = async (endpoint: string, body?: any) => {
    return await instance.post(endpoint, body || {})
        .then((res) => res.data)
        .catch((err) => {
            logger.error({
                from: 'socket-api',
                message: `Socket Api error! ${err?.message}`,
                result: err?.response?.data || err
            });
        });
};

const socketApi = { send };

export default socketApi;