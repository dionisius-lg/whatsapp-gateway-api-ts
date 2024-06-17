import { Request, Response, NextFunction } from "express";
import * as response from "./../helpers/response";

/**
 * Verify client's api key
 * @param  {Object} req - Express request object
 * @param  {Object} res - Express response object
 * @param  {Object} next - Express next method
 */
export const authenticateKey = (req: Request, res: Response, next: NextFunction) => {
    const { headers } = req;
    const authKey = headers?.['x-api-key'] || false;

    if (authKey) {
        const key = '123'
        // const key = readContent({ filename: 'key.txt' });

        if (key !== authKey) {
            return response.sendUnauthorized(res, 'API key not valid');
        }

        return next();
    }

    return response.sendForbidden(res);
};