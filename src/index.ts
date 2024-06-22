import express, { Express } from "express";
import cron from "node-cron";
import config from "./config";
import router from "./routes";
import { readContent, writeContent } from "./helpers/file";
import { randomString } from "./helpers/value";
import * as logger from "./helpers/logger";
import * as scheduleTask from "./helpers/schedule-task";

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

// running schedule task every 2 minutes
let isResendFailedMesssageInbound: boolean = false;
cron.schedule('*/2 * * * *', async () => {
    if (isResendFailedMesssageInbound) {
        console.log(`[schedule-task] resend failed message inbound to webhook client api is still running...`);
        return false;
    }

    isResendFailedMesssageInbound = true;
    await scheduleTask.resendFailedMesssageInbound();
    isResendFailedMesssageInbound = false;
});

// running schedule task every 5 minutes
let isResendFailedMesssageNotif: boolean = false;
cron.schedule('*/5 * * * *', async () => {
    if (isResendFailedMesssageNotif) {
        console.log(`[schedule-task] resend failed message notification to webhook client api is still running...`);
        return false;
    }

    isResendFailedMesssageNotif = true;
    await scheduleTask.resendFailedMesssageNotif();
    isResendFailedMesssageNotif = false;
});

// running schedule task every 15 minutes
let isUpdateTemplateStatus: boolean = false;
cron.schedule('*/15 * * * *', async () => {
    if (isUpdateTemplateStatus) {
        console.log(`[schedule-task] update template status from whatsapp api is still running...`);
        return false;
    }

    isUpdateTemplateStatus = true;
    await scheduleTask.updateTemplateStatus();
    isUpdateTemplateStatus = false;
});