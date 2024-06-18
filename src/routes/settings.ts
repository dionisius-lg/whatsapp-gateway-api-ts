import express, { Router } from "express";
import * as controller from "./../controllers/settings";
import validation from "../middleware/validation";
import fileValidation from "../middleware/file-validation";
import schema from "../schemas/settings";

const router: Router = express.Router();

router.get('/profiles', controller.getProfile);

router.post('/profiles', validation(schema.updateProfile, 'body'), controller.updateProfile);

router.get('/profiles/about', controller.getProfileAbout);

router.post('/profiles/about', validation(schema.updateProfileAbout, 'body'), controller.updateProfileAbout);

router.get('/profiles/photo', controller.getProfilePhoto);

router.post('/profiles/photo', fileValidation.singleFile({ fieldname: 'photo', filesize: 5, subpath: 'profile', filefilter: 'image' }), controller.updateProfilePhoto);

export default router;