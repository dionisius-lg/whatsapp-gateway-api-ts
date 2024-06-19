import { Request, Response } from "express";
import moment from "moment-timezone";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import whatsappApi from "./../helpers/whatsapp-api";
import config from "./../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

/**
 * Fetch Template Languages
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const fetchLanguages = async (req: Request, res: Response) => {
    try {
        const api = await whatsappApi.get('template-languages');

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Fetch template languages error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'template-languages:fetchLanguages',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'template-languages:fetchLanguages',
        //     message: `Fetch template languages success!`,
        //     result: api?.data || null
        // });

        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'template-languages:fetchLanguages',
            message: `Fetch template languages error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};