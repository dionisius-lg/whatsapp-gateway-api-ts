import { Request, Response } from "express";
import moment from "moment-timezone";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import whatsappApi from "./../helpers/whatsapp-api";
import config from "./../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

/**
 * Fetch Template Categories
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const fetchCategories = async (req: Request, res: Response) => {
    try {
        const api = await whatsappApi.get('template-categories');

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Fetch template categories error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'template-categories:fetchCategories',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'template-categories:fetchCategories',
        //     message: `Fetch template categories success!`,
        //     result: api?.data || null
        // });

        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'template-categories:fetchCategories',
            message: `Fetch template categories error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};