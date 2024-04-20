import * as Joi from 'joi'

export const validate = (data: any, Schema: Joi.ObjectSchema) => {
    const result = Schema.validate(data, { abortEarly: false, convert: true });
    return result
};
