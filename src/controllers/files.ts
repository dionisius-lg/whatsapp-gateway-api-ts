import moment from "moment-timezone";
import { Request, Response } from "express";
import { existsSync } from "fs";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import config from "./../config";
import { decrypt } from "./../helpers/encryption";
import { readContent } from "./../helpers/file";

const { timezone } = config;
const mimeTypes = () => {
    const result = readContent('mime-types.json');
    return Object.values(result) || [];
}

moment.tz.setDefault(timezone);

/**
 * Download File
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const downloadFile = async (req: Request, res: Response) => {
    const { params: { id } } = req;

    try {
        let decrypted: string = decrypt(id);
        let { path, file_name, file_size, mime_type } = JSON.parse(decrypted);
        let fullpath: string = (`${path}/${file_name}`).replace(/\/+/g, '/');

        if (existsSync(fullpath)) {
            if (mimeTypes().includes(mime_type)) {
                res.set({
                    'Content-Disposition': `attachment; filename=${file_name}`,
                    'Content-Type': mime_type,
                    'Content-Length': file_size,
                })

                return res.sendFile(file_name, { root: path });
            }

            return res.download(fullpath);
        }

        return response.sendNotFoundData(res);
    } catch (err: any) {
        logger.error({
            from: 'files:downloadFile',
            message: `Download file ${id} error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};