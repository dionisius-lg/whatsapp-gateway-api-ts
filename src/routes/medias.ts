import exress, { Router } from "express";
import * as controller from "./../controllers/medias";
import validation from "./../middleware/validation";
import schema from "./../schemas/medias";

const router: Router = exress.Router();

router.get('/:id', validation(schema.downloadMedia, 'params'), controller.downloadMedia);

export default router;