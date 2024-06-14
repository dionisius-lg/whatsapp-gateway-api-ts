import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as logger from "./../helpers/logger";
import config from "./../config";

const { whatsapp: { url, key } } = config;

const instance:  AxiosInstance = axios.create({
    baseURL: url,
    headers: { 'Accept': 'application/json', 'x-api-key': key }
});

const request = (method: string) => {
    return async (endpoint: string, body?: any) => {
        return await requestApi({ method, endpoint, body });
    };
};

interface RequestApiOptions {
    method: string;
    endpoint: string;
    body?: any;
}

const requestApi = async ({ method, endpoint, body }: RequestApiOptions) => {
    instance.defaults.headers['Content-Type'] = 'application/json';
    let result: any = {};

    switch (method) {
        case 'GET':
            result = await instance.get(endpoint).catch(handleError);
            break;
        case 'POST':
            result = await instance.post(endpoint, body || {}).catch(handleError);
            break;
        case 'PUT':
            result = await instance.put(endpoint, body || {}).catch(handleError);
            break;
        case 'PATCH':
            result = await instance.patch(endpoint, body || {}).catch(handleError);
            break;
        case 'DELETE':
            result = await instance.delete(endpoint).catch(handleError);
            break;
        case 'UPLOAD':
            instance.defaults.headers['Content-Type'] = 'multipart/form-data';
            result = await instance.post(endpoint, body).catch(handleError);
            break;
    }

    return {
        status: result.status,
        data: result.data
    };
};

const handleError = (err: any) => {
    if (err.response) {
        logger.error({
            from: 'whatsapp-api',
            message: `Whatsapp Api error! ${err?.message}`,
            result: err.response?.data
        });

        return {
            status: err.response?.status || 400,
            data: err.response?.data || { error: 'Bad request' }
        };
    }

    return {
        status: 500,
        data: { error: err?.message || 'Internal Server Error' }
    };
};

const whatsappApi = {
    get: request('GET'),
    post: request('POST'),
    put: request('PUT'),
    patch: request('PATCH'),
    delete: request('DELETE'),
    upload: request('UPLOAD')
};

export default whatsappApi;