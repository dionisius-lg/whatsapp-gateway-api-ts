import moment from "moment-timezone";
import * as _ from "lodash";
import config from "./../config";
import * as dbQuery from "./../helpers/db-query";

const table: string = 'directions';

interface ParsedQs {
    [key: string]: string | string[] | ParsedQs | ParsedQs[] | undefined;
}

interface Conditions {
    [key: string]: string | string[] | ParsedQs | ParsedQs[] | undefined;
}

export const getAll = async (conditions: Conditions = {}) => {
    // let asd: string[] | unknown =  await dbQuery.checkColumn({ table });
    // console.log(asd);
    // return asd

    const data = {
        name: 'Inbound',
        is_active: 0
    }

    let asd = await dbQuery.deleteData({ table, conditions });
    return asd;
}
