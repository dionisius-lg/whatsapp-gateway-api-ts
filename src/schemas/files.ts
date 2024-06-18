import Joi from "joi";
import JoiDate from "@joi/date";
import JoiStringFactory from "joi-phone-number";

// extend Joi with JoiDate and JoiStringFactory
const JoiExtended = Joi.extend(JoiDate).extend(JoiStringFactory);

const schema = {
    downloadFile: JoiExtended.object().keys({
        id: JoiExtended.string().min(1).required(),
    }),
};

export default schema;