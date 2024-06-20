import exress, { Router } from "express";
import * as controller from "./../controllers/template-categories";

const router: Router = exress.Router();

router.get('/', controller.fetchCategories);

export default router;