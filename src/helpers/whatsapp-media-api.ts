import axios, { AxiosInstance, AxiosResponse } from "axios";
import { existsSync, mkdirSync, createWriteStream } from "fs";
import mime from "mime-types";
import moment from "moment-timezone";
import * as logger from "./../helpers/logger";
import config from "./../config";

const { whatsapp: { url, key }, file_dir, timezone } = config;

moment.tz.setDefault(timezone);

const instance: AxiosInstance = axios.create({
    baseURL: url,
    headers: { 'X-Api-Key': key },
    responseType: 'stream'
});

interface DownloadOptions {
    id: string;
    mime_type?: string;
    caption?: string;
}

interface DownloadResult {
    status: number;
    data: {
        path?: string;
        file_name?: string;
        file_size?: number;
        mime_type?: string;
        error?: any
    };
}

const download = async ({ id, mime_type, caption }: DownloadOptions): Promise<DownloadResult> => {
    const ymd = moment(new Date()).format('YYYY/MM/DD');

    try {
        const res: AxiosResponse = await instance.get(`/media/${id}`);
        const { headers, data } = res;

        const ext = mime.extension(mime_type || headers['content-type']);
        const path = `${file_dir}/${ymd}`;
        const file_size = headers['content-length'];

        let file_name = headers['content-disposition'].split('filename=')[1] + `.${ext}`;

        if (caption) {
            let temp_name = caption.split('.')[0];
            file_name = `${temp_name.replace(/\s/g, '')}-${file_name}`;
        }

        if (!existsSync(path)) {
            mkdirSync(path, { recursive: true, mode: 0o777 });
        }

        data.pipe(createWriteStream(`${path}/${file_name}`));

        return {
            status: res.status,
            data: { path, file_name, file_size, mime_type }
        };
    } catch (err: any) {
        if (err.response) {
            logger.error({
                from: 'whatsapp-media-api',
                message: `Whatsapp Media Api error! ${err?.message}`,
                result: err.response?.data || err
            });
    
            return {
                status: err.response?.status || 400,
                data: err.response?.data || { error: 'Bad request' }
            };
        }

        return {
            status: 500,
            data: { error: 'Internal Server Error' }
        };
    }
};

export default { download };