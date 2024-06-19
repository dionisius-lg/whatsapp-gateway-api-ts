import Joi from "joi";
import JoiDate from "@joi/date";
import JoiStringFactory from "joi-phone-number";

// extend Joi with JoiDate and JoiStringFactory
const JoiExtended = Joi.extend(JoiDate).extend(JoiStringFactory);
// valid languange id
const validLanguageId = ['af', 'sq', 'ar', 'az', 'bn', 'bg', 'ca', 'zh_CN', 'zh_HK', 'zh_TW', 'hr', 'cs', 'da', 'nl', 'en', 'en_GB', 'en_US', 'et', 'fil', 'fi', 'fr', 'de', 'el', 'gu', 'ha', 'he', 'hi', 'hu', 'id', 'ga', 'it', 'ja', 'kn', 'kk', 'ko', 'lo', 'lv', 'lt', 'mk', 'ms', 'ml', 'mr', 'nb', 'fa', 'pl', 'pt_BR', 'pt_PT', 'pa', 'ro', 'ru', 'sr', 'sk', 'sl', 'es', 'es_AR', 'es_ES', 'es_MX', 'sw', 'sv', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'zu'];

const schema = {
    createTemplate: JoiExtended.object().keys({
        label: JoiExtended.string().min(1).required(),
        category_id: JoiExtended.string().min(1).valid('UTILITY', 'MARKETING').required(),
        language_id: JoiExtended.string().min(1).valid(...validLanguageId).required(),
        is_propose: JoiExtended.boolean().default(true),
        header: JoiExtended.object().keys({
            format: JoiExtended.string().min(1).valid('TEXT', 'IMAGE', 'DOCUMENT', 'VIDEO').required(),
            text: JoiExtended.any().when('format', {
                is: JoiExtended.string().valid('TEXT'),
                then: JoiExtended.string().min(1).required(),
                otherwise: JoiExtended.strip(),
            }),
            examples: JoiExtended.array().min(1).items(JoiExtended.string().min(1)).default([]),
            filename: JoiExtended.any().when('format', {
                is: JoiExtended.string().valid('DOCUMENT'),
                then: JoiExtended.string().min(1),
                otherwise: JoiExtended.strip(),
            }),
        }),
        body: JoiExtended.object().keys({
            text: JoiExtended.string().min(1).required(),
            examples: JoiExtended.array().min(1).items(JoiExtended.string().min(1)).default([]),
        }).required(),
        footer: JoiExtended.string().min(1),
        buttons: JoiExtended.array().min(1).items(JoiExtended.object().keys({
            type: JoiExtended.string().min(1).valid('URL', 'PHONE_NUMBER').required(),
            text: JoiExtended.string().min(1).required(),
            url: JoiExtended.any().when('type', {
                is: JoiExtended.string().valid('URL'),
                then: JoiExtended.string().uri().required(),
                otherwise: JoiExtended.strip()
            }),
            phone_number: JoiExtended.any().when('type', {
                is: JoiExtended.string().valid('PHONE_NUMBER'),
                then: JoiExtended.string().phoneNumber().required(),
                otherwise: JoiExtended.strip(),
            }),
        })),
    }),
    updateTemplate: JoiExtended.object().keys({
        label: JoiExtended.string().min(1).required(),
        category_id: JoiExtended.string().min(1).valid('UTILITY', 'MARKETING').required(),
        language_id: JoiExtended.string().min(1).valid(...validLanguageId).required(),
        is_propose: JoiExtended.boolean().default(true),
        header: JoiExtended.object().keys({
            format: JoiExtended.string().min(1).valid('TEXT', 'IMAGE', 'DOCUMENT', 'VIDEO').required(),
            text: JoiExtended.any().when('format', {
                is: JoiExtended.string().valid('TEXT'),
                then: JoiExtended.string().min(1).required(),
                otherwise: JoiExtended.strip(),
            }),
            examples: JoiExtended.array().min(1).items(JoiExtended.string().min(1)).default([]),
            filename: JoiExtended.any().when('format', {
                is: JoiExtended.string().valid('DOCUMENT'),
                then: JoiExtended.string().min(1),
                otherwise: JoiExtended.strip(),
            }),
        }),
        body: JoiExtended.object().keys({
            text: JoiExtended.string().min(1).required(),
            examples: JoiExtended.array().min(1).items(JoiExtended.string().min(1)).default([]),
        }).required(),
        footer: JoiExtended.string().min(1),
        buttons: JoiExtended.array().min(1).items(JoiExtended.object().keys({
            type: JoiExtended.string().min(1).valid('URL', 'PHONE_NUMBER').required(),
            text: JoiExtended.string().min(1).required(),
            url: JoiExtended.any().when('type', {
                is: JoiExtended.string().valid('URL'),
                then: JoiExtended.string().uri().required(),
                otherwise: JoiExtended.strip()
            }),
            phone_number: JoiExtended.any().when('type', {
                is: JoiExtended.string().valid('PHONE_NUMBER'),
                then: JoiExtended.string().phoneNumber().required(),
                otherwise: JoiExtended.strip(),
            }),
        })),
    }),
    fetchTemplateById: JoiExtended.object().keys({
        id: JoiExtended.string().min(1).required(),
    }),
};

export default schema;