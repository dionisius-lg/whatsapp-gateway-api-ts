import moment from "moment-timezone";
import * as _ from "lodash";
import config from "./../config";
import * as dbQuery from "./../helpers/db-query";

const table: string = 'directions';

interface Conditions {
    [key: string]: string | number | string[];
}

export const getAll = async (conditions: Conditions = {}) => {
    let asd: string[] | unknown =  await dbQuery.checkColumn({ table });
    console.log(asd);
    return asd
}
