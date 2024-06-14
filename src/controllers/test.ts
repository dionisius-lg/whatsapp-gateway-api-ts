import express, { Router, Request, Response, NextFunction } from "express";
import moment from "moment-timezone";
import * as _ from "lodash";
import * as models from "./../models/test";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import config from "./../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

export const inbound = async (req: Request, res: Response) => {
    const { query, body } = req;

    let asd = await models.getAll(query);

    console.log(asd);

    return response.sendBadRequest(res);
}