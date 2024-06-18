import moment from "moment-timezone";
import { Request, Response } from "express";
import * as model from "./../models/messages";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import whatsappApi from "./../helpers/whatsapp-api";
import config from "./../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

/**
 * Send Contact Message
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const sendContact = async (req: Request, res: Response) => {
    const { body } = req;
    const wa_id: string = body;

    let messageData = {
        type_id: 1,
        direction_id: 2,
        wa_id: wa_id,
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        const api = await whatsappApi.post('/messages/send-contact-message', body);

        if (![200,201].includes(api.status)) {
            let errorMessage: string = `Send contact message to ${wa_id} error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'messages:sendContact',
                message: errorMessage,
                result: api?.data || null
            });

            await model.insertData({ ...messageData, status_id: 5 });
            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'messages:sendContact',
        //     message: `Send contact message to ${wa_id} success!`,
        //     result: api?.data || null
        // });

        const wa_message_id = api?.data?.messages[0]?.id || null;
        await model.insertData({ ...messageData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss'), wa_message_id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'messages:sendContact',
            message: `Send contact message to ${wa_id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Send Location Message
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const sendLocation = async (req: Request, res: Response) => {
    const { body } = req;
    const { wa_id } = body;

    let messageData = {
        type_id: 2,
        direction_id: 2,
        wa_id: wa_id,
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        const api = await whatsappApi.post('/messages/send-location-message', body);

        if (![200,201].includes(api.status)) {
            let errorMessage: string = `Send location message to ${wa_id} error!`;

            if (api.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'messages:sendLocation',
                message: errorMessage,
                result: api?.data || null
            });

            await model.insertData({ ...messageData, status_id: 5 });
            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'messages:sendLocation',
        //     message: `Send location message to ${wa_id} success!`,
        //     result: api?.data || null
        // });

        const wa_message_id = api?.data?.messages[0]?.id;

        await model.insertData({ ...messageData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss'), wa_message_id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'messages:sendLocation',
            message: `Send location message to ${wa_id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Send Media Message
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const sendMedia = async (req: Request, res: Response) => {
    const { body } = req;
    const { wa_id } = body;

    let messageData = {
        type_id: 3,
        direction_id: 2,
        wa_id: wa_id,
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        const api = await whatsappApi.post('/messages/send-media-message', body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Send media message to ${wa_id} error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'messages:sendMedia',
                message: errorMessage,
                result: api?.data || null
            });

            await model.insertData({ ...messageData, status_id: 5 });
            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'messages:sendMedia',
        //     message: `Send media message to ${wa_id} success!`,
        //     result: api?.data || null
        // });

        const wa_message_id = api?.data?.messages[0]?.id;

        await model.insertData({ ...messageData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss'), wa_message_id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'messages:sendMedia',
            message: `Send media message to ${wa_id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Send Template Message
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const sendTemplate = async (req: Request, res: Response) => {
    const { body } = req;
    const { wa_id, template_id } = body;

    let messageData = {
        type_id: 4,
        direction_id: 2,
        wa_id: wa_id,
        wa_template_id: template_id,
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        const api = await whatsappApi.post('/messages/send-template-message', body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Send template message to ${wa_id} error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'messages:sendTemplate',
                message: errorMessage,
                result: api?.data || null
            });

            await model.insertData({ ...messageData, status_id: 5 });
            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'messages:sendTemplate',
        //     message: `Send template message to ${wa_id} success!`,
        //     result: api?.data || null
        // });

        const wa_message_id = api?.data?.messages[0]?.id;

        await model.insertData({ ...messageData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss'), wa_message_id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'messages:sendTemplate',
            message: `Send template message to ${wa_id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Send Text Message
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const sendText = async (req: Request, res: Response) => {
    const { body } = req;
    const { wa_id } = body;

    let messageData = {
        type_id: 5,
        direction_id: 2,
        wa_id: wa_id,
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        const api = await whatsappApi.post('/messages/send-text-message', body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Send text message to ${wa_id} error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'messages:sendText',
                message: errorMessage,
                result: api?.data || null
            });

            await model.insertData({ ...messageData, status_id: 5 });
            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'messages:sendText',
        //     message: `Send text message to ${wa_id} success!`,
        //     result: api?.data || null
        // });

        const wa_message_id = api?.data?.messages[0]?.id;

        await model.insertData({ ...messageData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss'), wa_message_id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'messages:sendText',
            message: `Send text message to ${wa_id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Send Reply Button Message
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const sendReplyButton = async (req: Request, res: Response) => {
    const { body } = req;
    const { wa_id } = body;

    let messageData = {
        type_id: 6,
        direction_id: 2,
        wa_id: wa_id,
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        const api = await whatsappApi.post('/messages/send-reply-button-message', body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Send reply button message to ${wa_id} error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'messages:sendReplyButton',
                message: errorMessage,
                result: api?.data || null
            });

            await model.insertData({ ...messageData, status_id: 5 });
            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'messages:sendReplyButton',
        //     message: `Send reply button message to ${wa_id} success!`,
        //     result: api?.data || null
        // });

        const wa_message_id = api?.data?.messages[0]?.id;

        await model.insertData({ ...messageData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss'), wa_message_id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'messages:sendReplyButton',
            message: `Send reply button message to ${wa_id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Send List Message
 * @param {Request} req
 * @param {Response} res
 * @returns response
 */
export const sendList = async (req: Request, res: Response) => {
    const { body } = req;
    const { wa_id } = body;

    let messageData = {
        type_id: 7,
        direction_id: 2,
        wa_id: wa_id,
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        const api = await whatsappApi.post('/messages/send-list-message', body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Send list message to ${wa_id} error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'messages:sendList',
                message: errorMessage,
                result: api?.data || null
            });

            await model.insertData({ ...messageData, status_id: 5 });
            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'messages:sendList',
        //     message: `Send list message to ${wa_id} success!`,
        //     result: api?.data || null
        // });

        const wa_message_id = api?.data?.messages[0]?.id;

        await model.insertData({ ...messageData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss'), wa_message_id });
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'messages:sendList',
            message: `Send list message to ${wa_id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};