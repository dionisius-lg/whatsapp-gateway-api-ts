import { Request } from "express";
import { existsSync, mkdirSync } from "fs";
import multer from "multer";
import * as _ from "lodash";
import { isEmpty } from "./../helpers/value";
import config from ".";

interface StorageOptions {
    subpath?: string | null;
}

type DestinationCallback = (err: Error | null, destination: string) => void;
type FilenameCallback = (err: Error | null, filename: string) => void;

const { file_dir } = config;

const storage = ({ subpath = null }: StorageOptions) => {
    return multer.diskStorage({
        destination: (req: Request, file: Express.Multer.File, callback: DestinationCallback): void => {
            let path = `${file_dir}/`;

            if (!isEmpty(subpath)) {
                path += `${subpath}/`;
                path = path.replace(/\/+/g, '/');

                if (!existsSync(path)) {
                    mkdirSync(path, { recursive: true });
                }
            }

            callback(null, path);
        },
        filename: (req: Request, file: Express.Multer.File, callback: FilenameCallback): void => {
            const { originalname, fieldname } = file;
            const extension = originalname.split('.').pop();
            const random = _.random(1000, 5000);

            callback(null, `${fieldname}-${random}-${Date.now()}.${extension}`);
        }
    });
};

export default storage;