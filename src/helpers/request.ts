/**
 * Remove invalid column from object
 * @param object 
 * @param keys 
 */
export const filterColumn = (object: Record<string, any> = {}, keys: string[] = []) => {
    Object.keys(object).forEach((key) => {
        if (!keys.includes(key)) {
            delete object[key];
        }
    });
};

export const filterData = (object: Record<string, any> = {}) => {
    Object.keys(object).forEach((key) => {
        if (object[key] === undefined || object[key] === false) {
            delete object[key];
        }

        if ((typeof object[key] === 'string' && (object[key]).trim() === '') && object[key] !== null) {
            object[key] = null;
        }
    });
};

export const filterParam = (object: Record<string, any> = {}, params: string[] = []) => {
    let options: Record<string, any> = {};

    params.forEach((param) => {
        if (object[param] !== undefined || object[param] !== '') {
            options[param] = object[param];
        }
    });

    return options;
};