import moment, { Moment } from "moment-timezone";
import * as _ from "lodash";
import config from "./../config";
import pool, { escape } from "./../config/pool";
import * as redisHelper from "./../helpers/redis";
import * as requestHelper from "./../helpers/request";
import { MysqlError } from "mysql";

const { timezone, database, redis } = config;

moment.tz.setDefault(timezone);

interface ConditionTypes {
    like: string[];
    date: string[];
}

interface ResultData {
    total_data: number;
    data: false | any;
    limit?: number;
    page?: number;
}

interface CheckColumnOptions {
    dbname?: string;
    table: string;
}

interface CheckCustomFieldOptions {
    table: string;
}

interface CountDataOptions {
    table: string;
    conditions?: Record<string, any>;
    conditionTypes?: ConditionTypes;
    customConditions?: string[];
    attributeColumn?: string;
    customFields?: string[];
    customDropdownFields?: string[];
    customAttributes?: Record<string, any>;
    join?: string[];
    groupBy?: string[];
    having?: string[];
}

interface GetAllOptions {
    table: string;
    conditions?: Record<string, any>;
    conditionTypes?: ConditionTypes;
    customConditions?: string[];
    columnSelect?: string[];
    columnDeselect?: string[];
    customColumns?: string[];
    attributeColumn?: string;
    join?: string[];
    groupBy?: string[];
    customOrders?: string[];
    having?: string[];
    cacheKey?: string;
}

interface GetDetailOptions {
    table: string | boolean;
    conditions?: Record<string, any>;
    customConditions?: string[];
    columnSelect?: string[];
    columnDeselect?: string[];
    customColumns?: string[];
    attributeColumn?: string;
    join?: string[];
    cacheKey?: string;
}

export const checkColumn = ({
    dbname = database.name,
    table
}: CheckColumnOptions): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const query = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${dbname}' AND TABLE_NAME = '${table}'`;

        pool.query(query, (err: MysqlError, results: any) => {
            if (err) {
                console.error(err);
                return reject(err);
            }

            const columns = results.map((c: { COLUMN_NAME: string }) => c.COLUMN_NAME);

            return resolve(columns);
        });
    });
};

export const CheckCustomField = ({
    table
}: CheckCustomFieldOptions): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        const query: string = `SELECT * FROM custom_fields WHERE is_active = 1 AND source_table = '${table}'`;

        pool.query(query, (err: MysqlError, results: any) => {
            if (err) {
                console.error(err);
                return reject(err);
            }

            const columns = results.map((c: { field_key: string; field_type_id: string }) => ({
                field_key: c.field_key,
                field_type_id: c.field_type_id,
            }));

            return resolve(columns);
        });
    });
};

export const countData = ({
    table,
    conditions,
    conditionTypes,
    customConditions,
    attributeColumn,
    customFields,
    customDropdownFields,
    customAttributes,
    join,
    groupBy,
    having
}: CountDataOptions) => {
    return new Promise<number>((resolve) => {
        let setCond: string[] = [];
        let setCustomCond: string[] = [];
        let queryCond: string = '';
        let query: string = `SELECT COUNT(*) AS count FROM ${table}`;
        let queryCount: string = '';

        if (join && !_.isEmpty(join) && _.isArrayLikeObject(join)) {
            query += join.join(' ');
        }

        if (conditions && !_.isEmpty(conditions)) {
            Object.keys(conditions).forEach((k) => {
                if (conditionTypes && !_.isEmpty(conditionTypes)) {
                    switch (true) {
                        case ((conditionTypes?.date).includes(k)):
                            let dateVal: Moment = _.toNumber(conditions[k]) > 0 ? moment(_.toNumber(conditions[k]) * 1000) : moment(new Date());
                            setCond.push(`DATE(${table}.${k}) = ${escape(dateVal.format('YYYY-MM-DD'))}`);
                            break;
                        case ((conditionTypes?.like).includes(k)):
                            setCond.push(`${table}.${k} LIke %${escape(conditions[k])}%`);
                            break;
                        default:
                            if (conditions[k].constructor === Array) {
                                setCond.push(`${table}.${k} IN (${escape(conditions[k])})`);
                            } else {
                                setCond.push(`${table}.${k} = ${escape(conditions[k])}`);
                            }
                            break;
                    }
                } else {
                    if (conditions[k].constructor === Array) {
                        setCond.push(`${table}.${k} IN (${escape(conditions[k])})`);
                    } else {
                        setCond.push(`${table}.${k} = ${escape(conditions[k])}`);
                    }
                }
            });


            queryCond = setCond.join(' AND ');
            query += ` WHERE ${queryCond}`;
        }

        if (attributeColumn && !_.isEmpty(attributeColumn)) {
            // for custom attributes
            let queryLine: string;

            if (customAttributes && !_.isEmpty(customAttributes)) {
                for (let k in customAttributes) {
                    switch (true) {
                        case (customDropdownFields && customDropdownFields.includes(k)):
                            queryLine = `JSON_EXTRACT(${table}.${attributeColumn}, '$.${k}.id') = ${escape(customAttributes[k])}`;
                            break;
                        default:
                            queryLine = `JSON_EXTRACT(LOWER(${table}.${attributeColumn}), '$.${k}') = LOWER(${escape(customAttributes[k])})`;
                            break;
                    }

                    setCustomCond.push(queryLine);
                }

                queryCond = setCustomCond.join((' AND '));
                query += (conditions && !_.isEmpty(conditions)) ? ` AND ${queryCond}` : ` WHERE ${queryCond}`;
            }
        }

        if (customConditions && !_.isEmpty(customConditions) && _.isArrayLikeObject(customConditions)) {
            queryCond = ` WHERE ` + customConditions.join(' AND ');

            if ((conditions && !_.isEmpty(conditions)) || (setCustomCond && !_.isEmpty(setCustomCond))) {
                queryCond = ` AND ` + customConditions.join(' AND ');
            }

            query += `${queryCond}`;
        }

        if (groupBy && !_.isEmpty(groupBy) && _.isArrayLikeObject(groupBy)) {
            let columnGroup = groupBy.join(', ');
            query += ` GROUP BY ${columnGroup}`;

            if (having && !_.isEmpty(having) && _.isArrayLikeObject(having)) {
                let havingClause = having.join(' AND ');
                query += ` HAVING ${havingClause}`;
            }

            queryCount = `SELECT COUNT(*) AS count FROM (${query}) AS count`;
            query = queryCount;
        }

        pool.query(query, (err: MysqlError, results: any) => {
            if (err) {
                console.error(err);
                return resolve(0);
            }

            const data: number = results[0].count;

            return resolve(data);
        });
    });
};

export const getAll = ({
    table,
    conditions,
    conditionTypes,
    customConditions,
    columnSelect,
    columnDeselect,
    customColumns,
    attributeColumn,
    join,
    groupBy,
    customOrders,
    having,
    cacheKey
}: GetAllOptions): Promise<Record<string, any>> => {
    return new Promise(async (resolve) => {
        let resultData: ResultData = {
            total_data: 0,
            data: false
        };

        let columns: string[] = await checkColumn({ table });
        const masterColumns = columns;
        let column: string = '';
        const customAttributes = conditions ? { ... conditions } : {};
        const sortData: string[] = ['ASC', 'DESC'];

        let order: boolean | string = conditions && conditions?.order || columns[0];
            order = typeof order === 'string' && columns.includes(order) ? order : columns[0];

        if (typeof conditions?.order === 'boolean' && conditions?.oredr === false) {
            order = false;
        }

        const sort: string = conditions && sortData.includes((conditions?.sort).toUpperCase()) ? (conditions.sort).toUpperCase() : 'ASC';
        let limit: number = conditions && _.toNumber(conditions?.limit) > 0 ? _.toNumber(conditions.limit) : 20;

        let page: number = conditions && _.toNumber(conditions?.page) || 1;
        let setCond: string[] = [];
        let queryCond: string = '';
        let getCustomFields: any[] = [];
        let customFields: string[] = [];
        let customDropdownFields: string[] = [];

        if (attributeColumn) {
            getCustomFields = await CheckCustomField({ table });
            customFields = _.map(getCustomFields, 'field_key')
            const getDropdownColumn = _.filter(getCustomFields, { 'field_type_id': 5 })
            customDropdownFields = _.map(getDropdownColumn, 'field_key')
            requestHelper.filterColumn(customAttributes, customFields);
        }

        if (columnSelect && !_.isEmpty(columnSelect) && _.isArrayLikeObject(columnSelect)) {
            // filter data from all table columns, only keep selected columns
            let validColumn = _.intersection(columnSelect, columns);
            columns = validColumn;
        }

        if (columnDeselect && !_.isEmpty(columnDeselect) && _.isArrayLikeObject(columnDeselect)) {
            if (columnDeselect.includes('*')) {
                // filter data, exclude all columns
                // let selectedColumn = _.difference(columns, deselectedColumn)
                columns = [];
            } else {
                // filter data, get column to exclude from valid selected columns or table columns
                let deselectedColumn = _.intersection(columnDeselect, columns);
                // filter data, exclude deselected columns
                let selectedColumn = _.difference(columns, deselectedColumn);
                columns = selectedColumn;
            }
        }

        if (join && !_.isEmpty(join) && _.isArrayLikeObject(join)) {
            // give prefix table to table columns
            let prefixColumn = columns.map((col: string) => {
                return `${table}.${col}`;
            });

            columns = prefixColumn;
        }

        column = columns.join(', ');

        if (attributeColumn && customFields && !_.isEmpty(customFields)) {
            let customField: string = '';
            let setCustomField: string[] = [];

            for (let i in customFields) {
                if (customDropdownFields && customDropdownFields.includes(customField[i])) {
                    setCustomField.push(`CONCAT_WS('||', JSON_UNQUOTE(JSON_EXTRACT(${table}.${attributeColumn}, '$.${customFields[i]}.id')), JSON_UNQUOTE(JSON_EXTRACT(${table}.${attributeColumn}, '$.${customFields[i]}.value'))) AS ${customFields[i]}`);
                } else {
                    setCustomField.push(`JSON_UNQUOTE(JSON_EXTRACT(${table}.${attributeColumn}, '$.${customFields[i]}')) AS ${customFields[i]}`);
                }
            }

            customField = setCustomField.join(', ');
            column += (!_.isEmpty(column)) ? `, ${customField}` : `${customField}`;
        }

        if (customColumns && !_.isEmpty(customColumns) && _.isArrayLikeObject(customColumns)) {
            if (_.isEmpty(columns)) {
                column += customColumns.join(', ');
            } else {
                column += ', ' + customColumns.join(', ');
            }
        }

        let query: string = `SELECT ${column} FROM ${table}`;

        if (join && !_.isEmpty(join) && _.isArrayLikeObject(join)) {
            let joinQuery: string = join.join(' ');
            query += ` ${joinQuery}`;
        }

        // remove invalid column from conditions
        requestHelper.filterColumn(conditions, masterColumns);

        if (conditions && !_.isEmpty(conditions)) {
            Object.keys(conditions).forEach((k) => {
                if (conditionTypes && !_.isEmpty(conditionTypes)) {
                    switch (true) {
                        case ((conditionTypes?.date).includes(k)):
                            let dateVal: Moment = _.toNumber(conditions[k]) > 0 ? moment(_.toNumber(conditions[k]) * 1000) : moment(new Date());
                            setCond.push(`DATE(${table}.${k}) = ${escape(dateVal.format('YYYY-MM-DD'))}`);
                            break;
                        case ((conditionTypes?.like).includes(k)):
                            setCond.push(`${table}.${k} LIke %${escape(conditions[k])}%`);
                            break;
                        default:
                            if (conditions[k].constructor === Array) {
                                setCond.push(`${table}.${k} IN (${escape(conditions[k])})`);
                            } else {
                                setCond.push(`${table}.${k} = ${escape(conditions[k])}`);
                            }
                            break;
                    }
                } else {
                    if (conditions[k].constructor === Array) {
                        setCond.push(`${table}.${k} IN (${escape(conditions[k])})`);
                    } else {
                        setCond.push(`${table}.${k} = ${escape(conditions[k])}`);
                    }
                }
            });

            queryCond = setCond.join(' AND ');
            query += ` WHERE ${queryCond}`;
        }

        if (attributeColumn && !_.isEmpty(attributeColumn)) {
            // for custom attributes
            let queryLine: string;

            if (customAttributes && !_.isEmpty(customAttributes)) {
                for (let k in customAttributes) {
                    switch (true) {
                        case (customDropdownFields && customDropdownFields.includes(k)):
                            queryLine = `JSON_EXTRACT(${table}.${attributeColumn}, '$.${k}.id') = ${escape(customAttributes[k])}`;
                            break;
                        default:
                            queryLine = `JSON_EXTRACT(LOWER(${table}.${attributeColumn}), '$.${k}') = LOWER(${escape(customAttributes[k])})`;
                            break;
                    }

                    setCond.push(queryLine);
                }
            }
        }

        queryCond = setCond.join(' AND ');
        query += !_.isEmpty(queryCond) ? ` WHERE ${queryCond}` : '';

        if (customConditions && !_.isEmpty(customConditions) && _.isArrayLikeObject(customConditions)) {
            queryCond = ' WHERE ' + customConditions.join(' AND ');

            if ((conditions && !_.isEmpty(conditions)) || (setCond && !_.isEmpty(setCond))) {
                queryCond = ' AND ' + customConditions.join(' AND ');
            }

            query += `${queryCond}`;
        }

        if (groupBy && !_.isEmpty(groupBy) && _.isArrayLikeObject(groupBy)) {
            let columnGroup: string = groupBy.join(', ');
            query += ` GROUP BY ${columnGroup}`;

            if (having && !_.isEmpty(having) && _.isArrayLikeObject(having)) {
                let havingClause: string = having.join(' AND ');
                query += ` HAVING ${havingClause}`;
            }
        }

        if (customOrders && !_.isEmpty(customOrders) && _.isArrayLikeObject(customOrders)) {
            query += ` ORDER BY ${customOrders}`;
        } else {
            if (order && typeof order === 'string' && !_.isEmpty(order)) {
                let orderColumn: string = order;

                if (join && !_.isEmpty(join) && _.isArrayLikeObject(join)) {
                    orderColumn = `${table}.${order}`;
                }

                query += ` ORDER BY ${orderColumn} ${sort}`;
            }
        }

        if (limit > 0) {
            const offset: number = (limit * page) - limit;

            if (_.isInteger(offset) && offset >= 0) {
                query += ` LIMIT ${limit} OFFSET ${offset}`;
            } else {
                query += ` LIMIT ${limit}`;
            }
        }

        let total_data: number = await countData({
            table,
            conditions,
            conditionTypes,
            customConditions,
            attributeColumn,
            customFields,
            customDropdownFields,
            customAttributes,
            join,
            groupBy,
            having
        });

        if (redis.service === 1) {
            const key: string = cacheKey || `${table}:all`;
            const getCache = await redisHelper.getDataQuery({ key, field: query });

            if (getCache) {
                // get data from cache
                return resolve(getCache);
            }
        }

        pool.query(query, (err: MysqlError, results: any) => {
            if (err) {
                console.error(err);
                return resolve(resultData);
            }

            resultData.total_data = total_data;
            resultData.data = results;
            resultData.limit = limit;
            resultData.page = page;

            if (redis.service === 1) {
                redisHelper.setDataQuery({ key: `${table}:all`, field: query, value: resultData })
            }

            return resolve(resultData);
        });
    });
};

export const getDetail = ({
    table,
    conditions,
    customConditions,
    columnSelect,
    columnDeselect,
    customColumns,
    attributeColumn,
    join,
    cacheKey
}: GetDetailOptions): Promise<Record<string, any>> => {
    return new Promise(async (resolve) => {
        let resultData: ResultData = {
            total_data: 0,
            data: false
        };

        let columns: string[] = [];

        if (typeof table === 'string' && !_.isEmpty(table)) {
            columns = await checkColumn({ table });
        }

        let column: string = '';
        const customAttributes = conditions ? { ... conditions } : {};

        let setCond: string[] = [];
        let queryCond:  string = '';
        let getCustomFields: any[] = [];
        let customFields: string[] = [];
        let customDropdownFields: string[] = [];

        if (attributeColumn) {
            if (typeof table === 'string' && !_.isEmpty(table)) {
                getCustomFields = await CheckCustomField({ table });
            }

            customFields = _.map(getCustomFields, 'field_key')
            const getDropdownColumn = _.filter(getCustomFields, { 'field_type_id': 5 })
            customDropdownFields = _.map(getDropdownColumn, 'field_key')
            requestHelper.filterColumn(customAttributes, customFields);
        }

        if (columnSelect && !_.isEmpty(columnSelect) && _.isArrayLikeObject(columnSelect)) {
            // filter data from all table columns, only keep selected columns
            let validColumn = _.intersection(columnSelect, columns);
            columns = validColumn;
        }

        if (columnDeselect && !_.isEmpty(columnDeselect) && _.isArrayLikeObject(columnDeselect)) {
            if (columnDeselect.includes('*')) {
                // filter data, exclude all columns
                // let selectedColumn = _.difference(columns, deselectedColumn)
                columns = [];
            } else {
                // filter data, get column to exclude from valid selected columns or table columns
                let deselectedColumn = _.intersection(columnDeselect, columns);
                // filter data, exclude deselected columns
                let selectedColumn = _.difference(columns, deselectedColumn);
                columns = selectedColumn;
            }
        }

        if (join && !_.isEmpty(join) && _.isArrayLikeObject(join)) {
            // give prefix table to table columns
            let prefixColumn = columns.map((col: string) => {
                return `${table}.${col}`;
            });

            columns = prefixColumn;
        }

        column = columns.join(', ');

        if (attributeColumn && customFields && !_.isEmpty(customFields)) {
            let customField: string = '';
            let setCustomField: string[] = [];

            for (let i in customFields) {
                if (customDropdownFields && customDropdownFields.includes(customField[i])) {
                    setCustomField.push(`CONCAT_WS('||', JSON_UNQUOTE(JSON_EXTRACT(${table}.${attributeColumn}, '$.${customFields[i]}.id')), JSON_UNQUOTE(JSON_EXTRACT(${table}.${attributeColumn}, '$.${customFields[i]}.value'))) AS ${customFields[i]}`);
                } else {
                    setCustomField.push(`JSON_UNQUOTE(JSON_EXTRACT(${table}.${attributeColumn}, '$.${customFields[i]}')) AS ${customFields[i]}`);
                }
            }

            customField = setCustomField.join(', ');
            column += (!_.isEmpty(column)) ? `, ${customField}` : `${customField}`;
        }

        if (customColumns && !_.isEmpty(customColumns) && _.isArrayLikeObject(customColumns)) {
            if (_.isEmpty(columns)) {
                column += customColumns.join(', ');
            } else {
                column += ', ' + customColumns.join(', ');
            }
        }

        if (customColumns && !_.isEmpty(customColumns) && _.isArrayLikeObject(customColumns)) {
            let append: string = '';

            if (column && !_.isEmpty(column)) {
                append = ', ';
            }

            column += append + customColumns.join(', ');
        }

        let query: string = `SELECT ${column}`

        if (typeof table === 'string' && !_.isEmpty(table)) {
            query += ` FROM ${table}`;
        }

        if (join && !_.isEmpty(join) && _.isArrayLikeObject(join)) {
            let joinQuery: string = join.join(' ');
            query += ` ${joinQuery}`;
        }

        if (conditions && !_.isEmpty(conditions)) {
            Object.keys(conditions).forEach((k: string) => {
                let kCond: string = k;

                if (typeof table === 'string' && !_.isEmpty(table) && join && !_.isEmpty(join) && _.isArrayLikeObject(join)) {
                    kCond = `${table}.${k}`;
                }

                setCond.push(`${kCond} = ${escape(conditions[k])}`);
            });

            queryCond = setCond.join(' AND ');
            query += ` WHERE ${queryCond}`;
        }

        if (customConditions && !_.isEmpty(customConditions) && _.isArrayLikeObject(customConditions)) {
            queryCond = ' WHERE ' + customConditions.join(' AND ');

            if ((conditions && !_.isEmpty(conditions))) {
                queryCond = ' AND ' + customConditions.join(' AND ');
            }

            query += `${queryCond}`;
        }

        if (typeof table === 'string' && !_.isEmpty(table)) {
            query += ` LIMIT 1`;

            if (redis.service === 1) {
                const key: string = cacheKey || table;
                const keyId: string = conditions && conditions?.id || '';
                const getCache = await redisHelper.getDataQuery({ key: `${key}${keyId}`, field: query });
    
                if (getCache) {
                    // get data from cache
                    return resolve(getCache);
                }
            }
        }

        pool.query(query, (err: MysqlError, results: any) => {
            if (err) {
                console.error(err);
                return resolve(resultData);
            }

            if (!_.isEmpty(results)) {
                resultData.total_data = 1;
                resultData.data = results[0];
                resultData.limit = 1;
                resultData.page = 0;

                if (typeof table === 'string' && !_.isEmpty(table) && redis.service === 1) {
                    const key: string = cacheKey || table;
                    const keyId: string = conditions && conditions?.id || '';
                    redisHelper.setDataQuery({ key: `${key}${keyId}`, field: query, value: resultData });
                }
            }

            return resolve(resultData);
        });
    });
};