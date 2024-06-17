import express, { Router } from "express";
import * as controller from "./../controllers/directions";
import validation from "../middleware/validation";
import schema from "../schemas/directions";

const router: Router = express.Router();

router.get('/', controller.getData);

router.get('/:id', validation(schema.getDataById, 'params'), controller.getDataById);

router.post('/', validation(schema.insertData, 'body'), controller.insertData);

router.put('/:id', validation(schema.getDataById, 'params'), validation(schema.udpateData, 'body'), controller.updateDataById);

router.delete('/:id', validation(schema.getDataById, 'params'), controller.deleteDataById);

export default router;