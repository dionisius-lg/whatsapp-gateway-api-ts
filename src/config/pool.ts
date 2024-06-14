import mysql, { PoolOptions } from "mysql2";
import config from ".";

const { database } = config;

const options: PoolOptions = {
    host: database.host,
    port: database.port,
    user: database.username,
    password: database.password,
    database: database.name,
    connectionLimit: 50,
    charset: 'UTF8MB4_GENERAL_CI',
    // Allow multiple mysql statements per query
    multipleStatements: true,
    // Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather then inflated into JavaScript Date objects
    dateStrings: true
};

export const escape = mysql.escape;
const pool = mysql.createPool(options);

pool.getConnection((err) => {
    if (err) throw err;
});

export default pool;