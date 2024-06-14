import { Response } from "express";
import moment from "moment-timezone";
import _ from "lodash";
import config from "./../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

/**
 * Success 200 OK
 * @param {Object} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
export const sendSuccess = (res: Response, data: {} | string[]): object => {
    return res.status(200).send(data);
};

/**
 * Success 201 OK
 * @param {Object} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
export const sendSuccessCreated = (res: Response, data: {}): object => {
    return res.status(201).send(data);
};

/**
 * Success 204 OK
 * @param {Object} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
export const sendSuccessDeleted = (res: Response, data: {}): object => {
    return res.status(204).send(data);
};

/**
 * Error 400 Bad Request
 * @param {Object} res
 * @param {string} message
 * @returns {Object} JSON object
 */
export const sendBadRequest = (res: Response, message?: string): object => {
    let error: string = message || 'Request is invalid';
    return res.status(400).send({ error });
};

/**
 * Error 401 Unauthorized
 * @param {Object} res
 * @param {string} message
 * @returns {Object} JSON object
 */
export const sendUnauthorized = (res: Response, message?: string): object => {
    let error: string = message || 'You do not have rights to access this resource';
    return res.status(401).send({ error });
};

/**
 * Error 403 Forbidden
 * @param {Object} res
 * @returns {Object} JSON object
 */
export const sendForbidden = (res: Response): object => {
    let error: string = 'You do not have rights to access this resource';
    return res.status(403).send({ error });
};

/**
 * Error 404 Resource Not Found
 * @param {Object} res
 * @returns {Object} JSON object
 */
export const sendNotFound = (res: Response): object => {
    let error: string = 'Resource not found';
    return res.status(404).send({ error });
};

/**
 * Error 404 Data Not Found
 * @param {Object} res
 * @param {Object} data
 * @returns {Object} JSON object
 */
export const sendNotFoundData = (res: Response, message?: string): object => {
    let error: string = message || 'Data not found';
    return res.status(404).send({ error });
};

/**
 * Error 405 Method not allowed
 * @param {Object} res
 * @param {string} message
 * @returns {Object} JSON object
 */
export const sendMethodNotAllowed = (res: Response): object => {
    let error: string = 'This resource is not match with your request method';
    return res.status(405).send({ error });
};

/**
 * Error 429 Too Many Request
 * @param {Object} res
 * @param {string} message
 * @returns {Object} JSON object
 */
export const sendTooManyRequests = (res: Response, message?: string): object => {
    let error: string = message || 'Too Many Requests';
    return res.status(429).send({ error });
};

/**
 * Error 500 Internal Server Error
 * @param {Object} res
 * @returns {Object} JSON object
 */
export const sendInternalServerError = (res: Response): object => {
    let error: string = 'The server encountered an error, please try again later';
    return res.status(500).send({ error });
};