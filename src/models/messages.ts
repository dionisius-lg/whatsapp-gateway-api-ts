import moment from "moment-timezone";
import config from "./../config";
import * as dbQuery from "./../helpers/db-query";
import { isEmpty } from "./../helpers/value";

const { timezone } = config;
const table = 'messages';

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
    let customConditions: string[] = [];

    if (isEmpty(conditions?.sent) && typeof conditions.sent === 'string' && (conditions.sent).toUpperCase() === 'NULL') {
        customConditions.push(`${table}.sent IS NULL`);
        delete conditions.sent;
    }

    return await dbQuery.getAll({ table, conditions, customConditions });
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