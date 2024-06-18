import express, { Router } from "express";
import * as controller from "./../controllers/messages";
import validation from "../middleware/validation";
import schema from "../schemas/messages";

const router: Router = express.Router();

router.post('/send-contact-message', validation(schema.sendContact, 'body'), controller.sendContact);

router.post('/send-location-message', validation(schema.sendLocation, 'body'), controller.sendLocation);

router.post('/send-media-message', validation(schema.sendMedia, 'body'), controller.sendMedia);

router.post('/send-template-message', validation(schema.sendTemplate, 'body'), controller.sendTemplate);

router.post('/send-text-message', validation(schema.sendText, 'body'), controller.sendText);

router.post('/send-reply-button-message', validation(schema.sendReplyButton, 'body'), controller.sendReplyButton);

router.post('/send-list-message', validation(schema.sendList, 'body'), controller.sendList);

export default router;