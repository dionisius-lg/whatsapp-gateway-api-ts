import moment from "moment-timezone";
import * as _ from "lodash";
import config from "./../config";
import * as dbQuery from "./../helpers/db-query";

const table: string = 'directions';

interface Conditions {
    [key: string]: string | number | string[];
}

export const getAll = async (conditions: Conditions = {}) => {
    // let asd: string[] | unknown =  await dbQuery.checkColumn({ table });
    // console.log(asd);
    // return asd

    const data = {
        name: 'Inbound   ',
        is_active: 1,
        asd: 1
    }

    let asd = await dbQuery.insertData({ table, data });
    return asd;
}
