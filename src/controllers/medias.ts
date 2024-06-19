import { Request, Response } from "express";
import moment from "moment-timezone";
import * as model from "./../models/messages";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import whatsappMediaApi from "./../helpers/whatsapp-media-api";
import { encrypt } from "./../helpers/encryption";
import { isDomainAddress } from "./../helpers/value";
import config from "./../config";

const { timezone, port } = config;

moment.tz.setDefault(timezone);

/**
 * Download Media
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const downloadMedia = async (req: Request, res: Response) => {
    const { params: { id }, protocol, hostname } = req

    try {
        let { data } = await model.getDetail({ wa_media_id: id });

        if (!data) {
            const api = await whatsappMediaApi.download({ id });

            if (![200, 201].includes(api.status)) {
                let errorMessage: string = `Download media ${id} error!`;

                logger.error({
                    from: 'medias:downloadMedia',
                    message: errorMessage,
                    result: api?.data || null
                });
    
                return response.sendBadRequest(res, errorMessage);
            }

            // this function is commented out to prevent high memory/disk
            // logger.success({
            //     from: 'medias:downloadMedia',
            //     message: `Download media ${id} success!`,
            //     result: api?.data || null
            // });

            data = api.data;

            await model.insertUpdateData([{ ...data, wa_media_id: id }]);
        }

        const encrypted = encrypt(JSON.stringify(data));
        let link = `${protocol}://${hostname}`;

        switch (true) {
            case (isDomainAddress(hostname)):
                link += '/whatsapp-api';
                break;
            default:
                link += `:${port}`;
                break;
        }

        link += `/files/${encrypted}`;

        return response.sendSuccess(res, { link });
    } catch (err: any) {
        logger.error({
            from: 'medias:downloadMedia',
            message: `Download media ${id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};