import { Request, Response } from "express";
import moment from "moment-timezone";
import * as model from "./../models/message-templates";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import whatsappApi from "./../helpers/whatsapp-api";
import config from "./../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

interface MessageTemplateData {
    label: any;
    category_id: any;
    language_id: any;
    is_propose: any;
    header: string | null;
    body: string | null;
    footer: any;
    buttons: string | null;
    status_id?: number;
}

/**
 * Fetch Message Template
 * @param {Request} req
 * @param {Response} res
 * @returns {Object} - response result
 */
export const fetchTemplate = async (req: Request, res: Response) => {
    const { params: { id } } = req;

    try {
        let endpoint: string = 'message-templates';

        if (id) {
            endpoint += `/${id}`;
        }

        const api = await whatsappApi.get(endpoint);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Fetch template error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'message-templates:fetchTemplate',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'message-templates:fetchTemplate',
        //     message: `Fetch template success!`,
        //     result: api?.data || null
        // });

        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'message-templates:fetchTemplate',
            message: `Fetch template error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Create Message Template
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const createTemplate = async (req: Request, res: Response) => {
    const { body } = req;

    let messageTemplateData: MessageTemplateData = {
        label: body?.label || null,
        category_id: body?.category_id || null,
        language_id: body?.language_id || null,
        is_propose: body?.is_propose || false,
        header: body.hasOwnProperty('header') ? JSON.stringify(body.header) : null,
        body: body.hasOwnProperty('body') ? JSON.stringify(body.body) : null,
        footer: body?.footer || null,
        buttons: body.hasOwnProperty('buttons') ? JSON.stringify(body.buttons) : null,
    };

    try {
        const api = await whatsappApi.post('/message-templates', body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Create template error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'message-templates:createTemplate',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'message-templates:createTemplate',
        //     message: `Create template success! ID ${api.data.messages.id}`,
        //     result: api?.data || null
        // });

        if (api?.data?.messages?.status && typeof api?.data?.messages?.status === 'string') {
            switch (true) {
                case (['APPROVED'].includes((api.data.messages.status).toUpperCase())):
                    messageTemplateData.status_id = 6;
                    break;
                case (['REJECTED'].includes((api.data.messages.status).toUpperCase())):
                    messageTemplateData.status_id = 7;
                    break;
                case (['FLAGGED', 'REVISION'].includes((api.data.messages.status).toUpperCase())):
                    messageTemplateData.status_id = 8;
                    break;
                case (['PAUSED'].includes((api.data.messages.status).toUpperCase())):
                    messageTemplateData.status_id = 9;
                    break;
                default:
                    messageTemplateData.status_id = messageTemplateData.is_propose ? 10 : 11;
                    break;
            }
        }

        await model.insertData({ ...messageTemplateData, template_id: api.data.messages.id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'message-templates:createTemplate',
            message: `Create template error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Update Message Template By ID
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const updateTemplate = async (req: Request, res: Response) => {
    const { body, params: { id } } = req;

    let messageTemplateData: MessageTemplateData = {
        label: body?.label || null,
        category_id: body?.category_id || null,
        language_id: body?.language_id || null,
        is_propose: body?.is_propose || 'false',
        header: body.hasOwnProperty('header') ? JSON.stringify(body.header) : null,
        body: body.hasOwnProperty('body') ? JSON.stringify(body.body) : null,
        footer: body?.footer || null,
        buttons: body.hasOwnProperty('buttons') ? JSON.stringify(body.buttons) : null,
    };

    try {
        const api = await whatsappApi.put(`/message-templates/${id}`, body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Update template error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'message-templates:updateTemplate',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'message-templates:updateTemplate',
        //     message: `Update template success! ID ${id}`,
        //     result: api?.data || null
        // });

        await model.updateData(messageTemplateData, { template_id: id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'message-templates:updateTemplate',
            message: `Update template error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Propose Message Template
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const proposeTemplate = async (req: Request, res: Response) => {
    const { params: { id } } = req;

    try {
        const api = await whatsappApi.post(`/message-templates/${id}/propose`, {});

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Propose template error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'message-templates:proposeTemplate',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'message-templates:proposeTemplate',
        //     message: `Propose template success! ID ${id}`,
        //     result: api?.data || null
        // });

        await model.updateData({ status_id: 10 }, { template_id: id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'message-templates:proposeTemplate',
            message: `Create template error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};