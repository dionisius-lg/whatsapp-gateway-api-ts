import express, { Express } from "express";
import config from "./config";
import router from "./routes";
import { readContent, writeContent } from "./helpers/file";
import { randomString } from "./helpers/value";
import * as logger from "./helpers/logger";

const app: Express = express();
const { env, port } = config;

// enable parsing json
app.use(express.json());
// enable parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// log all access
logger.access(app);
// define all route
app.use(router);
// disable x-powered-by
app.disable('x-powered-by');

app.listen(port, async (err?: Error) => {
    if (err) {
        console.log(err);
    }

    // check api key
    let key = readContent('key.txt');

    // generate new api key if not exist
    if (!key) {
        key = randomString(32, true, true);
        writeContent('key.txt', key);

        console.log(`[server] is generate new Api Key ${key}`);
    }

    console.log(`[server] is running for ${env} environtment | port ${port}`);
});