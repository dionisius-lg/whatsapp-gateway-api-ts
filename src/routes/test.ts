import express, { Router } from "express";
import * as controller from "./../controllers/test";

const router: Router = express.Router();

router.get('/', controller.inbound);

export default router;