import express, { Express } from "express";
import config from "./config";
import router from "./routes";

const app: Express = express();
const { env, port, file_dir } = config;

// enable parsing json
app.use(express.json());
// enable parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// disable x-powered-by
app.disable('x-powered-by');
// define all route
app.use(router);

app.listen(port, async (err?: Error) => {
    if (err) {
        console.log(err);
    }

    console.log(`[server] is running for ${env} environtment | port ${port}`);
});