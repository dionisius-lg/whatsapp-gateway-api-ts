import express, { Router } from "express";
import * as controller from "./../controllers/directions";

const router: Router = express.Router();

router.get('/', controller.getData);

router.get('/:id', controller.getDataById);

router.post('/', controller.insertData);

router.put('/:id', controller.updateDataById);

router.delete('/:id', controller.deleteDataById);

export default router;