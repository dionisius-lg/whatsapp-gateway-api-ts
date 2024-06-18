import Joi from "joi";
import JoiDate from "@joi/date";
import JoiStringFactory from "joi-phone-number";

// extend Joi with JoiDate and JoiStringFactory
const JoiExtended = Joi.extend(JoiDate).extend(JoiStringFactory);

const schema = {
    sendContact: JoiExtended.object().keys({
        wa_id: JoiExtended.string().phoneNumber().required(),
        contacts: JoiExtended.array().min(1).items(JoiExtended.object().keys({
            name: JoiExtended.object().keys({
                formatted_name: JoiExtended.string().min(1).max(20),
            }),
            org: JoiExtended.object().keys({
                department: JoiExtended.string().min(1).max(20),
                title: JoiExtended.string().min(1).max(20),
                company: JoiExtended.string().min(1).max(20),
            }),
            emails: JoiExtended.array().min(1).items(JoiExtended.object().keys({
                email: JoiExtended.string().min(1).max(100).required(),
                type: JoiExtended.string().valid('HOME', 'WORK').required(),
            })),
            phones: JoiExtended.array().min(1).items(JoiExtended.object().keys({
                phone: JoiExtended.string().phoneNumber().required(),
                type: JoiExtended.string().valid('HOME', 'WORK', 'CELL', 'MAIN', 'IPHONE').required(),
            })),
            birthday: JoiExtended.date().format('YYYY-MM-DD').raw(),
            addresses: JoiExtended.array().min(1).items(JoiExtended.object().keys({
                street: JoiExtended.string().min(1).max(50),
                city: JoiExtended.string().min(1).max(30),
                state: JoiExtended.string().min(1).max(10),
                zip: JoiExtended.string().min(1).max(8),
                country: JoiExtended.string().min(1).max(20),
                country_code: JoiExtended.string().min(1).max(5),
                type: JoiExtended.string().valid('HOME', 'WORK').required(),
            })),
            urls: JoiExtended.array().min(1).items(JoiExtended.object().keys({
                url: JoiExtended.string().uri().required(),
                type: JoiExtended.string().valid('HOME', 'WORK').required(),
            })),
        })).required(),
    }),

    sendLocation: JoiExtended.object().keys({
        wa_id: JoiExtended.string().phoneNumber().required(),
        latitude: JoiExtended.number().required(),
        longitude: JoiExtended.number().required(),
        name: JoiExtended.string().min(1).required(),
        address: JoiExtended.string().min(1).required(),
    }),

    sendMedia: JoiExtended.object().keys({
        wa_id: JoiExtended.string().phoneNumber().required(),
        type: JoiExtended.string().valid('audio', 'document', 'image', 'sticker', 'video').required(),
        link: JoiExtended.string().uri().required(),
        caption: JoiExtended.any().when('type', {
            is: JoiExtended.string().valid('document', 'image', 'video'),
            then: JoiExtended.string().min(1).max(1024),
            otherwise: JoiExtended.strip(),
        }),
        filename: JoiExtended.any().when('type', {
            is: JoiExtended.string().valid('document'),
            then: JoiExtended.string().min(1),
            otherwise: JoiExtended.strip(),
        }),
    }),

    sendTemplate: JoiExtended.object().keys({
        wa_id: JoiExtended.string().phoneNumber().required(),
        template_id: JoiExtended.number().min(1).required(),
        components: JoiExtended.array().min(1).items(JoiExtended.object().keys({
            type: JoiExtended.string().valid('body', 'header').required(),
            parameters: JoiExtended.array().min(1).items(JoiExtended.object().keys({
                type: JoiExtended.string().valid('document', 'image', 'text', 'video').required(),
                document: JoiExtended.any().when('type', {
                    is: JoiExtended.string().valid('document'),
                    then: JoiExtended.object().keys({
                        link: JoiExtended.string().uri().required(),
                        filename: JoiExtended.string().min(1),
                    }).required(),
                    otherwise: JoiExtended.strip(),
                }),
                text: JoiExtended.any().when('type', {
                    is: JoiExtended.string().valid('text'),
                    then: JoiExtended.string().min(1).required(),
                    otherwise: JoiExtended.strip(),
                }),
                image: JoiExtended.any().when('type', {
                    is: JoiExtended.string().valid('image'),
                    then: JoiExtended.object().keys({
                        link: JoiExtended.string().uri().required(),
                    }).required(),
                    otherwise: JoiExtended.strip(),
                }),
                video: JoiExtended.any().when('type', {
                    is: JoiExtended.string().valid('video'),
                    then: JoiExtended.object().keys({
                        link: JoiExtended.string().uri().required(),
                    }).required(),
                    otherwise: JoiExtended.strip(),
                }),
            })),
        })),
    }),

    sendText: JoiExtended.object().keys({
        wa_id: JoiExtended.string().phoneNumber().required(),
        text: JoiExtended.string().min(1).max(4096).required(),
    }),

    sendReplyButton: JoiExtended.object().keys({
        wa_id: JoiExtended.string().phoneNumber().required(),
        header: JoiExtended.object().keys({
            type: JoiExtended.string().valid('document', 'image', 'text', 'video').required(),
            text: JoiExtended.any().when('type', {
                is: JoiExtended.string().valid('text'),
                then: JoiExtended.string().min(1).max(60).required(),
                otherwise: JoiExtended.strip(),
            }),
            link: JoiExtended.any().when('type', {
                is: JoiExtended.string().valid('document', 'image', 'video'),
                then: JoiExtended.string().uri().required(),
                otherwise: JoiExtended.strip(),
            }),
            filename: JoiExtended.any().when('type', {
                is: JoiExtended.string().valid('document'),
                then: JoiExtended.string().min(1),
                otherwise: JoiExtended.strip(),
            }),
        }),
        body: JoiExtended.string().min(1).max(1024).required(),
        footer: JoiExtended.string().min(1).max(60),
        action: JoiExtended.object().keys({
            buttons: JoiExtended.array().min(1).max(3).items(JoiExtended.object().keys({
                id: JoiExtended.string().min(1).max(256).required(),
                title: JoiExtended.string().min(1).max(20).required(),
            })).required(),
        }).required(),
    }),

    sendList: JoiExtended.object().keys({
        wa_id: JoiExtended.string().phoneNumber().required(),
        header: JoiExtended.object().keys({
            type: JoiExtended.string().valid('text').required(),
            text: JoiExtended.string().min(1).max(60).required(),
        }),
        body: JoiExtended.string().min(1).max(1024).required(),
        footer: JoiExtended.string().min(1).max(60),
        action: JoiExtended.object().keys({
            button: JoiExtended.string().min(1).max(20).required(),
            sections: JoiExtended.array().min(1).max(10).items(JoiExtended.object().keys({
                title: JoiExtended.string().min(1).max(24).required(),
                rows: JoiExtended.array().min(1).max(10).items(JoiExtended.object().keys({
                    id: JoiExtended.string().min(1).max(200).required(),
                    title: JoiExtended.string().min(1).max(24).required(),
                    description: JoiExtended.string().min(1).max(72),
                })).unique('id').required(),
            })).unique((a: any, b: any) => {
                return a.rows.some((item1: any) => b.rows.some((item2: any) => item1.id === item2.id));
            }).required(),
        }).required(),
    }),
};

export default schema;