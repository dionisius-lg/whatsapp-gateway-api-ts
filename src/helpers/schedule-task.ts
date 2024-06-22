import moment from "moment-timezone";
import whatsappApi from "./whatsapp-api";
import webhookClientApi from "./webhook-client-api";
import * as logger from "./logger";
import * as messageNotificationsModel from "./../models/message-notifications";
import * as messageTemplatesModel from "./../models/message-templates";
import * as messagesModel from "./../models/messages";
import * as webhookClientsModel from "./../models/webhook-clients";
import config from "../config";

const { timezone } = config;

moment.tz.setDefault(timezone);

interface MessageInterface {
    status_id: number;
    sent_attempt: number;
    sent?: string;
}

/**
 * Resend Failed Message Inbound to Webhook Client
 */
export const resendFailedMesssageInbound = async () => {
    const messages = await messagesModel.getAll({ sent: 'NULL', direction_id: 1 });
    const webhookClients = await webhookClientsModel.getAll({ is_active: 1 });

    // check messages & webhook client data from database
    if ((messages?.total_data && messages.total_data > 0) && (webhookClients?.total_data && webhookClients.total_data > 0)) {
        // loop row message data
        for (let i in messages?.data) {
            let { id, content, sent_attempt } = messages.data[i];

            // we try to resend up to 3x include first try send, so we check sent attempt first
            if (sent_attempt >= 3) {
                continue;
            }

            let result = { success: 0, error: 0 };
            let messageData: MessageInterface = { status_id: 5, sent_attempt: parseInt(sent_attempt) + 1 };
            let send = await webhookClientApi.send({ clients: webhookClients.data, body: content });

            if (send.success > 0) {
                messageData.status_id = 1;
                messageData.sent = moment().format('YYYY-MM-DD HH:mm:ss');
            }

            await messagesModel.updateData(messageData, { id });

            result.success += send.success;
            result.error += send.error;

            console.log(`[schedule-task] resend failed message inbound to webhook client api done. ID: ${id}. Success: ${result.success}. Error: ${result.error}`);
        }
    }
};

/**
 * Resend Failed Message Notification to Webhook Client
 */
export const resendFailedMesssageNotif = async () => {
    const messageNotifications = await messageNotificationsModel.getAll({ status_id: 5, sent: 'NULL' });
    const webhookClients = await webhookClientsModel.getAll({ is_active: 1 });

    // check message notifications & webhook client data from database
    if ((messageNotifications?.total_data && messageNotifications.total_data > 0) && (webhookClients?.total_data && webhookClients.total_data > 0)) {
        // loop row message notifications data
        for (let i in messageNotifications?.data) {
            let { id, content, sent_attempt } = messageNotifications.data[i];

            // we try to resend up to 3x include first try send, so we check sent attempt first
            if (sent_attempt >= 3) {
                continue;
            }

            let result = { success: 0, error: 0 };
            let messageNotificationData: MessageInterface = { status_id: 5, sent_attempt: parseInt(sent_attempt) + 1 };
            let send = await webhookClientApi.send({ clients: webhookClients.data, body: content });

            if (send.success > 0) {
                messageNotificationData.status_id = 1;
                messageNotificationData.sent = moment().format('YYYY-MM-DD HH:mm:ss');
            }

            await messageNotificationsModel.updateData(messageNotificationData, { id });

            result.success += send.success;
            result.error += send.error;

            console.log(`[schedule-task] resend failed message notification to webhook client api done. ID: ${id}. Success: ${result.success}. Error: ${result.error}`);
        }
    }
};

/**
 * Update Template Status from Whatsapp API
 */
export const updateTemplateStatus = async () => {
    const messageTemplates = await messageTemplatesModel.getAll({ status_id: [9, 10] });

    // check message templates data from database
    if (messageTemplates?.total_data && messageTemplates.total_data > 0) {
        let result = { success: 0, error: 0 };

        for (let i in messageTemplates?.data) {
            let { template_id } = messageTemplates.data[i];
            let api = await whatsappApi.get(`/message-templates/${template_id}`);

            if ([200, 201].includes(api.status) && api.data?.status) {
                switch (true) {
                    case (typeof api.data?.status === 'string' && ['APPROVED'].includes((api.data.status).toUpperCase())):
                        let update1 = await messageTemplatesModel.updateData({ status_id: 6 }, { template_id });

                        if (update1.total_data > 0) {
                            result.success += 1;
                        } else {
                            result.error += 1;
                        }
                        break;
                    case (typeof api.data?.status === 'string' && ['REJECTED'].includes((api?.data?.status).toUpperCase())):
                        let update2 = await messageTemplatesModel.updateData({ status_id: 7 }, { template_id });

                        if (update2.total_data > 0) {
                            result.success += 1;
                        } else {
                            result.error += 1;
                        }
                        break;
                    case (typeof api.data?.status === 'string' && ['FLAGGED', 'REVISION'].includes((api?.data?.status).toUpperCase())):
                        let update3 = await messageTemplatesModel.updateData({ status_id: 8 }, { template_id });

                        if (update3.total_data > 0) {
                            result.success += 1;
                        } else {
                            result.error += 1;
                        }
                        break;
                    case (typeof api.data?.status === 'string' && ['PAUSED'].includes((api?.data?.status).toUpperCase())):
                        let update4 = await messageTemplatesModel.updateData({ status_id: 9 }, { template_id });

                        if (update4.total_data > 0) {
                            result.success += 1;
                        } else {
                            result.error += 1;
                        }
                        break;
                }
            }
        }

        console.log(`[schedule-task] update template status from whatsapp api done. Success: ${result.success}. Error: ${result.error}`);
    }
};