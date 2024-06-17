import { Response } from "express";
import moment from "moment-timezone";
import _ from "lodash";
import config from "./../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

interface Result {
    [key: string]: any;
}

/**
 * Success 200 OK
 * @param {Response} res
 * @param {Result} result
 * @returns {Object} JSON object
 */
export const sendSuccess = (res: Response, result: Result | Result[] | null): object => {
    if (result && _.isPlainObject(result)) {
        if ('total_data' in result && 'data' in result && 'limit' in result && 'page' in result) {
            if (_.isArray(result['data']) && _.toNumber(result['total_data']) > 0 && _.toNumber(result['limit']) > 0) {
                const currentPage = _.toNumber(result['page']) || 1;
                const previousPage = currentPage - 1;
                const nextPage = currentPage + 1;
                const firstPage = 1;
                const lastPage = _.ceil(_.toNumber(result['total_data'] || 1) / _.toNumber(result['limit'] || 1));

                result.paging = {
                    current: currentPage,
                    previous: previousPage > 0 ? previousPage : 1,
                    next: nextPage <= lastPage ? nextPage : lastPage,
                    first: firstPage,
                    last: lastPage > 0 ? lastPage : 1
                }
            }

            delete result['limit'];
            delete result['page'];
        }
    }

    return res.status(200).send(result);
};

/**
 * Success 201 Created
 * @param {Response} res
 * @param {Result} result
 * @returns {Object} JSON object
 */
export const sendSuccessCreated = (res: Response, result: Result | Result[] | null): object => {
    return res.status(201).send(result);
};

/**
 * Error 400 Bad Request
 * @param {Response} res
 * @param {string} message
 * @returns {Object} JSON object
 */
export const sendBadRequest = (res: Response, message?: string): object => {
    let error: string = message || 'Request is invalid';
    return res.status(400).send({ error });
};

/**
 * Error 401 Unauthorized
 * @param {Response} res
 * @param {string} message
 * @returns {Object} JSON object
 */
export const sendUnauthorized = (res: Response, message?: string): object => {
    let error: string = message || 'You do not have rights to access this resource';
    return res.status(401).send({ error });
};

/**
 * Error 403 Forbidden
 * @param {Response} res
 * @returns {Object} JSON object
 */
export const sendForbidden = (res: Response): object => {
    let error: string = 'You do not have rights to access this resource';
    return res.status(403).send({ error });
};

/**
 * Error 404 Resource Not Found
 * @param {Response} res
 * @returns {Object} JSON object
 */
export const sendNotFound = (res: Response): object => {
    let error: string = 'Resource not found';
    return res.status(404).send({ error });
};

/**
 * Error 404 Data Not Found
 * @param {Response} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
export const sendNotFoundData = (res: Response, message?: string): object => {
    let error: string = message || 'Data not found';
    return res.status(404).send({ error });
};

/**
 * Error 405 Method not allowed
 * @param {Response} res
 * @param {string} message
 * @returns {Object} JSON object
 */
export const sendMethodNotAllowed = (res: Response): object => {
    let error: string = 'This resource is not match with your request method';
    return res.status(405).send({ error });
};

/**
 * Error 429 Too Many Request
 * @param {Response} res
 * @param {string} message
 * @returns {Object} JSON object
 */
export const sendTooManyRequests = (res: Response, message?: string): object => {
    let error: string = message || 'Too Many Requests';
    return res.status(429).send({ error });
};

/**
 * Error 500 Internal Server Error
 * @param {Response} res
 * @returns {Object} JSON object
 */
export const sendInternalServerError = (res: Response): object => {
    let error: string = 'The server encountered an error, please try again later';
    return res.status(500).send({ error });
};