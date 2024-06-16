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

    const data = [
        {
            id: 3,
            name: 'Inbound',
            is_active: 0
        },
        {
            id: 4,
            name: 'Outbound',
            is_active: 0
        }
    ]

    let asd = await dbQuery.insertDuplicateUpdateData({ table, data });
    return asd;
}
