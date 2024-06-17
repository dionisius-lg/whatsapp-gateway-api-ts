import { Request, Response } from "express";
import * as model from "./../models/directions";
import * as response from "./../helpers/response";

export const getData = async (req: Request, res: Response) => {
    const { query } = req;

    const result = await model.getAll(query);

    if (result.data) {
        return response.sendSuccess(res, result);
    }

    return response.sendNotFoundData(res);
};

export const getDataById = async (req: Request, res: Response) => {
    const { params: { id } } = req;

    const result = await model.getDetail({ id });

    if (result.data) {
        return response.sendSuccess(res, result);
    }

    return response.sendNotFoundData(res);
};

export const insertData = async (req: Request, res: Response) => {
    const { body } = req;

    const result = await model.insertData(body);

    if (result.data) {
        return response.sendSuccessCreated(res, result);
    }

    return response.sendBadRequest(res);
};

export const updateDataById = async (req: Request, res: Response) => {
    const { body, params: { id } } = req;

    const result = await model.updateData(body, { id });

    if (result.data) {
        return response.sendSuccess(res, result);
    }

    return response.sendBadRequest(res);
};

export const deleteDataById = async (req: Request, res: Response) => {
    const { params: { id } } = req;

    const result = await model.deleteData({ id });

    if (result.data) {
        return response.sendSuccess(res, result);
    }

    return response.sendBadRequest(res);
};