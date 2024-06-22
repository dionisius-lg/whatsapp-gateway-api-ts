import { Request, Response } from "express";
import moment from "moment-timezone";
import * as mediasModel from "./../models/medias";
import * as messagesModel from "./../models/messages";
import * as messageNotificationsModel from "./../models/message-notifications";
import * as webhookClientsModel from "./../models/webhook-clients";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import webhookClientApi from "./../helpers/webhook-client-api";
import whatsappMediaApi from "./../helpers/whatsapp-media-api";
import config from "./../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

/**
 * Receive Inbound From Webhook
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const inbound = async (req: Request, res: Response) => {
    const { body } = req;

    let messageNotificationData = {
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        const { data } = await webhookClientsModel.getAll({ is_active: 1 });

        if (data) {
            const send = await webhookClientApi.send({ clients: data, body });

            switch (true) {
                case (send.success > 0):
                    await messageNotificationsModel.insertData({ ...messageNotificationData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss') });
                    break;
                default:
                    await messageNotificationsModel.insertData({ ...messageNotificationData, status_id: 5 });
                    break;
            }
        } else {
            logger.error({
                from: 'webhooks:inbound',
                message: `Send webhook client error! Webhook client not found`
            });

            await messageNotificationsModel.insertData({ ...messageNotificationData, status_id: 5 });
        }

        return response.sendSuccess(res, body);
    } catch (err: any) {
        logger.error({
            from: 'webhooks:inbound',
            message: `Send webhook client error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Receive Inbound Status From Webhook
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const inboundStatus = async (req: Request, res: Response) => {
    const { body } = req;
    const { statuses } = body;
    const { id, status } = statuses[0];

    let messageNotificationData = {
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        let status_id: number = 0;

        if (status && typeof status === 'string') {
            switch (true) {
                // case (['SENT'].includes(status.toUpperCase())):
                //     status_id = 1;
                //     break;
                case (['DELIVERED'].includes(status.toUpperCase())):
                    status_id = 2;
                    break;
                case (['READ'].includes(status.toUpperCase())):
                    status_id = 3;
                    break;
                case (['DELETED'].includes(status.toUpperCase())):
                    status_id = 4;
                    break;
                case (['FAILED'].includes(status.toUpperCase())):
                    status_id = 5;
                    break;
            }

            if (status_id > 0) {
                await messagesModel.updateData({ status_id }, { wa_message_id: id });
            }
        }

        const { data } = await webhookClientsModel.getAll({ is_active: 1 });

        if (data) {
            const send = await webhookClientApi.send({ clients: data, body });

            switch (true) {
                case (send.success > 0):
                    await messageNotificationsModel.insertData({ ...messageNotificationData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss') });
                    break;
                default:
                    await messageNotificationsModel.insertData({ ...messageNotificationData, status_id: 5 });
                    break;
            }
        } else {
            logger.error({
                from: 'webhooks:inboundStatus',
                message: `Send webhook client error! Webhook client not found`
            });

            await messageNotificationsModel.insertData({ ...messageNotificationData, status_id: 5 });
        }

        return response.sendSuccess(res, body);
    } catch (err: any) {
        logger.error({
            from: 'webhooks:inboundStatus',
            message: `Send webhook client error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

interface MessageData {
    type_id: number;
    direction_id: number;
    wa_id: string | number;
    wa_message_id: string | number;
    wa_media_id?: any;
    content: string | null;
    sent_attempt: number;
}

/**
 * Receive Inbound Message From Webhook
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const inboundMessage = async (req: Request, res: Response) => {
    const { body } = req;
    const { contacts, messages } = body;
    const { wa_id } = contacts[0];
    const { type, id } = messages[0];

    let messageData: MessageData = {
        type_id: 5,
        direction_id: 1,
        wa_id: wa_id,
        wa_message_id: id,
        content: JSON.stringify(body),
        sent_attempt: 1,
    };

    try {
        switch (true) {
            case (type === 'contacts'):
                messageData.type_id = 1;
                break;
            case (type === 'location'):
                messageData.type_id = 2;
                break;
            case (['image', 'video', 'document', 'voice', 'audio', 'sticker'].includes(type)):
                messageData.type_id = 3;
                messageData.wa_media_id = messages[0][`${type}`].id

                const mediaApi = await whatsappMediaApi.download({
                    id: messages[0][`${type}`].id,
                    mime_type: messages[0][`${type}`].mime_type,
                    caption: messages[0][`${type}`]?.caption || null
                });

                if ([200, 201].includes(mediaApi.status)) {
                    logger.success({
                        from: 'webhooks:inboundMessage',
                        message: `Download media ${messages[0][`${type}`].id} success!`,
                        result: mediaApi?.data || null
                    });

                    await mediasModel.insertUpdateData([{
                        wa_media_id: messages[0][`${type}`].id,
                        path: mediaApi.data.path,
                        file_name: mediaApi.data.file_name,
                        file_size: mediaApi.data.file_size,
                        mime_type: mediaApi.data?.mime_type || null
                    }]);
                } else {
                    logger.error({
                        from: 'webhooks:inboundMessage',
                        message: `Download media ${messages[0][`${type}`].id} error!`,
                        result: mediaApi?.data || null
                    });
                }
                break;
            default:
                messageData.type_id = 5;
                break;
        }

        const { data } = await webhookClientsModel.getAll({ is_active: 1 });

        if (data) {
            const send = await webhookClientApi.send({ clients: data, body });

            switch (true) {
                case (send.success > 0):
                    await messagesModel.insertData({ ...messageData, status_id: 1, sent: moment().format('YYYY-MM-DD HH:mm:ss') });
                    break;
                default:
                    await messagesModel.insertData({ ...messageData, status_id: 5 });
                    break;
            }
        } else {
            logger.error({
                from: 'webhooks:inboundMessage',
                message: `Send webhook client error! Webhook client not found`
            });

            await messagesModel.insertData({ ...messageData, status_id: 5 });
        }

        return response.sendSuccess(res, body);
    } catch (err: any) {
        logger.error({
            from: 'webhooks:inboundMessage',
            message: `Send webhook client error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};