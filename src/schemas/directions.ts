import Joi from "joi";
import JoiDate from "@joi/date";
import JoiPhoneNumber from "joi-phone-number";

// extend Joi with JoiDate and JoiPhoneNumber
Joi.extend(JoiDate);
Joi.extend(JoiPhoneNumber);

const schema = {
    getDataById: Joi.object().keys({
        id: Joi.number().min(1).required(),
    }),
    insertData: Joi.object().keys({
        name: Joi.string().min(1).required(),
        is_active: Joi.number().valid(0,1),
    }),
    udpateData: Joi.object().keys({
        name: Joi.string().min(1).required(),
        is_active: Joi.number().valid(0,1),
    }),
}

export default schema;