import exress, { Router } from "express";
import * as controller from "./../controllers/template-languages";

const router: Router = exress.Router();

router.get('/', controller.fetchLanguages);

export default router;