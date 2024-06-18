import express, { Router } from "express";
import * as controller from "./../controllers/files";
import validation from "../middleware/validation";
import schema from "../schemas/files";

const router: Router = express.Router();

router.get('/:id', validation(schema.downloadFile, 'params'), controller.downloadFile);

export default router;