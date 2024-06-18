import { Request, Response, NextFunction } from "express";
import moment from "moment-timezone";
import multer from "multer";
import * as _ from "lodash";
import storage from "./../config/storage";
import { imageFilter } from "./../helpers/file";
import * as response from "./../helpers/response";

interface FileConfig {
    fieldname: string;
    subpath?: string;
    filesize?: number;
    filefilter?: string;
    filemax?: number;
}

const singleFile = ({ fieldname, subpath = '', filesize = 1, filefilter }: FileConfig) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ymd: string = moment(new Date()).format('YYYY/MM/DD');

        let options: multer.Options = {
            storage: storage({ subpath: `${subpath}/${ymd}` }),
            // limits in bytes
            limits: { fileSize: 1000000 * filesize }
        };

        if (filefilter && filefilter.trim().toLowerCase() === 'image') {
            options.fileFilter = imageFilter;
        }

        const upload = multer(options).single(fieldname);

        upload(req, res, async (err) => {
            switch (true) {
                case (!req.file):
                    let message: string = 'Please select file to upload';

                    if (filefilter && filefilter.trim().toLowerCase() === 'image') {
                        options.fileFilter = imageFilter;
                    }

                    if (_.isObjectLike(err) && err.message !== undefined) {
                        message = err.message;
                    }

                    return response.sendBadRequest(res, message);
                    break;
                case (err):
                    return response.sendBadRequest(res, err?.message || 'File failed to upload');
                    break;
            }

            next();
        });
    }
};

const mutiFile = ({ fieldname, subpath = '', filesize = 1, filefilter, filemax = 1 }: FileConfig) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ymd: string = moment(new Date()).format('YYYY/MM/DD');

        let options: multer.Options = {
            storage: storage({ subpath: `${subpath}/${ymd}` }),
            // limits in bytes
            limits: { fileSize: 1000000 * filesize }
        };

        if (filefilter && filefilter.trim().toLowerCase() === 'image') {
            options.fileFilter = imageFilter;
        }

        const upload = multer(options).array(fieldname, filemax);

        upload(req, res, async (err) => {
            switch (true) {
                case (!req.file):
                    let message: string = 'Please select file to upload';

                    if (filefilter && filefilter.trim().toLowerCase() === 'image') {
                        options.fileFilter = imageFilter;
                    }

                    if (_.isObjectLike(err) && err.message !== undefined) {
                        message = err.message;
                    }

                    return response.sendBadRequest(res, message);
                    break;
                case (err):
                    return response.sendBadRequest(res, err?.message || 'File failed to upload');
                    break;
            }

            next();
        });
    }
};

export default {
    singleFile,
    mutiFile
};