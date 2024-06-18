import moment from "moment-timezone";
import { Request, Response } from "express";
import { createReadStream, unlinkSync, existsSync } from "fs";
import formData from "form-data";
import * as model from "./../models/settings";
import * as response from "./../helpers/response";
import * as logger from "./../helpers/logger";
import whatsappApi from "./../helpers/whatsapp-api";
import config from "./../config";
import { isDomainAddress, isJson } from "./../helpers/value";
import { encrypt } from "./../helpers/encryption";

const { timezone, port } = config;

moment.tz.setDefault(timezone);

interface FileAttributes {
    path: string;
    file_name: string;
    file_size: number;
    mime_type: string;
}

/**
 * Get Whatsapp Business Profile
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const { data } = await model.getDetail({ code: 'WHATSAPP_PROFILE' });

        if (data) {
            let { attributes } = data;

            if (isJson(attributes) && attributes.length > 0) {
                attributes = JSON.parse(attributes);
                const profile = attributes;

                const result = { profile };
                return response.sendSuccess(res, result);
            }
        }

        const api = await whatsappApi.get('/settings/business-profile');

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Get business profile error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'settings:getProfile',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'settings:getProfile',
        //     message: `Get business profile success!`,
        //     result: api?.data || null
        // });

        const { data: { settings: {business: { profile } } } } = api;

        await model.insertUpdateData([{ code: 'WHATSAPP_PROFILE', attributes: JSON.stringify(profile) }]);
        return response.sendSuccess(res, api.data);
    } catch (err: any) {
        logger.error({
            from: 'settings:getProfile',
            message: `Get business profile error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Update Whatsapp Business Profile
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const updateProfile = async (req: Request, res: Response) => {
    const { body } = req;

    try {
        let profileData = {
            code: 'WHATSAPP_PROFILE',
            attributes: JSON.stringify(body),
        };

        const api = await whatsappApi.post('/settings/business-profile', body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Update business profile error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'settings:updateProfile',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'settings:updateProfile',
        //     message: `Update business profile success!`,
        //     result: api?.data || null
        // });

        await model.insertUpdateData([profileData]);
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'settings:updateProfile',
            message: `Update business profile error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Get Whatsapp Business Profile About
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const getProfileAbout = async (req: Request, res: Response) => {
    try {
        const { data } = await model.getDetail({ code: 'WHATSAPP_PROFILE_ABOUT' });

        if (data) {
            let { attributes } = data;

            if (isJson(attributes) && attributes.length > 0) {
                attributes = JSON.parse(attributes);
                const { text } = attributes;

                const result = { about: { text } };
                return response.sendSuccess(res, result);
            }
        }

        const api = await whatsappApi.get('/settings/profiles/about');

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Get business profile about error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'settings:getProfileAbout',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'settings:getProfileAbout',
        //     message: `Get business profile about success!`,
        //     result: api?.data || null
        // });

        const { data: { settings: { profile: { about } } } } = api;

        await model.insertUpdateData([{ code: 'WHATSAPP_PROFILE_ABOUT', attributes: JSON.stringify(about) }]);
        return response.sendSuccess(res, { about });
    } catch (err: any) {
        logger.error({
            from: 'settings:getProfileAbout',
            message: `Get business profile about error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Update Whatsapp Business Profile About
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const updateProfileAbout = async (req: Request, res: Response) => {
    const { body } = req;

    try {
        let profileAboutData = {
            code: 'WHATSAPP_PROFILE_ABOUT',
            attributes: JSON.stringify(body),
        };

        const api = await whatsappApi.patch('/settings/profiles/about', body);

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Update business profile about error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'settings:updateProfileAbout',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'settings:updateProfileAbout',
        //     message: `Update business profile about success!`,
        //     result: api?.data || null
        // });

        await model.insertUpdateData([profileAboutData]);
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'settings:updateProfileAbout',
            message: `Update business profile about error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Get Whatsapp Business Profile Photo
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const getProfilePhoto = async (req: Request, res: Response) => {
    const { protocol, hostname } = req;

    try {
        const { data } = await model.getDetail({ code: 'WHATSAPP_PROFILE_PHOTO' });
console.log('----------------------', data)
        if (data) {
            const { attributes } = data;
console.log('----------------------', attributes)
            if (isJson(attributes) && attributes.length > 0) {
                // if (existsSync(attributes?.path + attributes?.file_name)) {
                    const encrypted = encrypt(attributes);

                    let link = `${protocol}://${hostname}`;

                    switch (true) {
                        case (isDomainAddress(hostname)):
                            link += '/whatsapp-api';
                            break;
                        default:
                            link += `:${port}`;
                            break;
                    }

                    link += `/files/${encrypted}`;

                    const result = { photo: { link } };
                    return response.sendSuccess(res, result);
                // }
            }
        }

        const api = await whatsappApi.get('/settings/profiles/photo');

        if (![200, 201].includes(api.status)) {
            let errorMessage: string = `Get business profile photo error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'settings:getProfilePhoto',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'settings:getProfilePhoto',
        //     message: `Get business profile photo success!`,
        //     result: api?.data || null
        // });

        const { data: { settings: { profile: { photo } } } } = api;

        return response.sendSuccess(res, { photo });
    } catch (err: any) {
        logger.error({
            from: 'settings:getProfilePhoto',
            message: `Get business profile photo error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};

/**
 * Update Whatsapp Business Profile Photo
 * @param {Request} req 
 * @param {Response} res 
 * @returns response
 */
export const updateProfilePhoto = async (req: Request, res: Response) => {
    const { file } = req as { file: Express.Multer.File };

    try {
        const attributes: FileAttributes = {
            path: file.destination.replace(/\/+/g, '/'),
            file_name: file.filename,
            file_size: file.size,
            mime_type: file.mimetype
        };

        let profilePhotoData = {
            code: 'WHATSAPP_PROFILE_PHOTO',
            description: 'Whatsapp Business Profile Photo',
            attributes: JSON.stringify(attributes),
        };

        let body = new formData();
            body.append('photo', createReadStream(file.path));

        const api = await whatsappApi.post('/settings/business-profile', body);

        if (![200,201].includes(api.status)) {
            unlinkSync(file.path);

            let errorMessage: string = `Update business profile photo error!`;

            if (api?.data?.message) {
                errorMessage += ` ${api.data.message}`;
            }

            logger.error({
                from: 'settings:updateProfilePhoto',
                message: errorMessage,
                result: api?.data || null
            });

            return response.sendBadRequest(res, errorMessage);
        }

        // this function is commented out to prevent high memory/disk
        // logger.success({
        //     from: 'settings:updateProfilePhoto',
        //     message: `Update business profile photo success!`,
        //     result: api?.data || null
        // });

        await model.insertUpdateData([profilePhotoData]);
        return response.sendSuccess(res, api?.data || null);
    } catch (err: any) {
        logger.error({
            from: 'settings:updateProfilePhoto',
            message: `Update business profile photo error! ${err?.message}`,
            result: err
        });

        return response.sendInternalServerError(res);
    }
};