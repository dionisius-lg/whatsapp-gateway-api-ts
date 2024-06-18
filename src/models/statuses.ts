import moment from "moment-timezone";
import config from "./../config";
import * as dbQuery from "./../helpers/db-query";

const { timezone } = config;
const table = 'statuses';

moment.tz.setDefault(timezone);

interface ParsedQs {
    [key: string]: string | string[] | ParsedQs | ParsedQs[] | undefined;
}

interface Conditions {
    [key: string]: string | string[] | ParsedQs | ParsedQs[] | undefined;
}

interface Data {
    [key: string]: any;
}

export const getAll = async (conditions: Conditions) => {
    const conditionTypes = {
        'like': ['name']
    };

    return await dbQuery.getAll({ table, conditions, conditionTypes });
};

export const getDetail = async (conditions: Conditions) => {
    return await dbQuery.getDetail({ table, conditions });
};

export const insertData = async (data: Data) => {
    const protectedColumns = ['id'];
    return await dbQuery.insertData({ table, data, protectedColumns });
};

export const updateData = async (data: Data, conditions: Conditions) => {
    const protectedColumns = ['id'];
    return await dbQuery.updateData({ table, data, conditions, protectedColumns});
};

export const deleteData = async (conditions: Conditions) => {
    return await dbQuery.deleteData({ table, conditions });
};