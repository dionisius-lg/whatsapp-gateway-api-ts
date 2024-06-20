import exress, { Router } from "express";
import * as controller from "./../controllers/message-templates";
import validation from "./../middleware/validation";
import schema from "./../schemas/message-templates";

const router: Router = exress.Router();

router.post('/', validation(schema.createTemplate, 'body'), controller.createTemplate);

router.get('/:id', validation(schema.fetchTemplateById, 'params'), controller.fetchTemplate);

router.put('/:id', validation(schema.fetchTemplateById, 'params'), validation(schema.updateTemplate, 'body'), controller.updateTemplate);

router.post('/:id/propose', validation(schema.fetchTemplateById, 'params'), controller.proposeTemplate);

export default router;