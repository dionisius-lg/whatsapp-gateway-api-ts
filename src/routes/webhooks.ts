import express, { Router, Request, Response } from "express";
import * as controller from "./../controllers/webhooks";

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const { body } = req;

    switch (true) {
        case (body.hasOwnProperty('contacts')):
            return controller.inboundMessage(req, res);
            break;
        case (body.hasOwnProperty('statuses')):
            return controller.inboundStatus(req, res);
        default:
            return controller.inbound(req, res);
            break;
    }
});

export default router;