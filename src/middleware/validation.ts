import { Request, Response, NextFunction } from "express";
import { existsSync, unlinkSync } from "fs";
import * as response from "./../helpers/response";

const validation = (schema: any, property: string, file: boolean = false) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req[property as keyof typeof req]);

        if (error) {
            const { details } = error;
            const message = details.map((i: any) => i.message).join(',');

            // check file upload
            if (file) {
                switch (true) {
                    // single file
                    case (req.file !== undefined):
                        const { destination, filename } = req.file;
                        const file = `${destination}/${filename}`;

                        // delete file that already uploaded by multer middleware
                        if (existsSync(file)) {
                            unlinkSync(file);
                        }
                        break;
                    // multiple file
                    case (req.files !== undefined):
                        for (let f of req.files as Express.Multer.File[]) {
                            const { destination, filename } = f;
                            const file = `${destination}/${filename}`;

                            // delete files that already uploaded by multer middleware
                            if (existsSync(file)) {
                                unlinkSync(file);
                            }
                        }
                        
                        break;
                }
            }

            return response.sendBadRequest(res, message);
        }

        if (property === 'body') {
            req.body = value;
        }

        return next();
    };
};

export default validation;