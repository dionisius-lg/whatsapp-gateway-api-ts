import axios, { AxiosResponse } from "axios";
import * as logger from "./../helpers/logger";
import { isJson, isEmpty } from "./../helpers/value";

interface Client {
    url: string;
    auth_key?: string;
    auth_value?: string;
}

interface SendOptions {
    clients: Client[];
    body?: Record<string, any>
}

interface SendResult {
    success: number;
    error: number;
}

const send = async ({ clients = [], body = {} }: SendOptions): Promise<SendResult> => {
    let result: SendResult = { success: 0, error: 0 };

    if (clients.length > 0) {
        let promises: Promise<AxiosResponse<any>>[] = [];

        for (let client of clients) {
            let headers: Record<string, string> = { 'Content-Type': 'application/json' };

            if (client.auth_key && !isEmpty(client.auth_key) && client.auth_value && !isEmpty(client.auth_value)) {
                headers[client.auth_key] = client.auth_value;
            }

            promises.push(axios.post(client.url, body, { headers }));
        }

        await Promise.allSettled(promises).then((responses) => {
            responses.forEach((response) => {
                switch (true) {
                    case (response.status === 'fulfilled'):
                        let { value } = response;

                        logger.success({
                            from: 'webhook-client',
                            message: `Send to webhook ${value.config?.url} success!`,
                            result: {
                                request: value.config?.data,
                                response: value?.data
                            }
                        });

                        result.success += 1;
                        break;
                    case (response.status === 'rejected'):
                        let { reason } = response;

                        logger.error({
                            from: 'webhook-client',
                            message: `Send to webhook client ${reason.config?.url} error! ${reason?.message}`,
                            result: {
                                request: reason.config?.data,
                                response: reason.response && isJson(reason.response?.data) ? reason.response.data : null
                            }
                        });

                        result.error += 1;
                        break;
                }
            });
        });
    }

    return result;
};

const webhookClient = { send };

export default webhookClient;