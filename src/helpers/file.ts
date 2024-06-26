import { Request } from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { isJson, isEmpty } from "./value";

export const imageFilter = (req: Request & Express.Multer.File, file: any, cb: Function) => {
    const mimetype = file?.mimetype || '';
    const filetype = mimetype.split('/');

    // accept image only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/) || filetype[0] != 'image') {
        return cb(new Error('Only image files are allowed'), false);
    }
};

export const readContent = (filename: string, subpath?: string): any => {
    try {
        if (isEmpty(filename)) {
            return false;
        }

        let filedir = './';

        if (subpath && !isEmpty(subpath)) {
            filedir += `${subpath}/`;
        }

        const file = readFileSync(`${filedir}${filename}`);
        const data = file.toString();

        return isJson(data) ? JSON.parse(data) : data;
    } catch (err) {
        return false;
    }
};

export const writeContent = (filename: string, data: any, subpath?: string): boolean => {
    try {
        if (isEmpty(filename) || isEmpty(data)) {
            return false;
        }

        let filedir = './';

        if (subpath && !isEmpty(subpath)) {
            // replace multiple slash to single slash
            subpath = subpath.replace(/\/+/g, '/');
            // remove first & last slash
            subpath = subpath.replace(/^\/|\/$/g, '');

            filedir += `${subpath}/`;

            if (!existsSync(filedir)) {
                mkdirSync(filedir, { mode: 0o777 });
            }
        }

        if (isJson(data)) {
            data = JSON.stringify(data);
        }

        writeFileSync(`${filedir}${filename}`, data, 'utf8');
        return true;
    } catch (err) {
        return false;
    }
};