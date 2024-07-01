export const randomString = (size: number = 32, numeric: boolean = false, specialchar: boolean = false): string => {
    let string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';

    if (numeric) {
        string += '1234567890';
    }

    if (specialchar) {
        string += '!@#$&';
    }

    for (let i = 0; i < size; i++) {
        let random = Math.floor(Math.random() * string.length);
        result += string.charAt(random);
    }

    return result;
};

export const isJson = (value: any): any | false => {
    let result = typeof value !== 'string' ? JSON.stringify(value) : value;

    try {
        result = JSON.parse(result);

        if (typeof result === 'object' && !isEmpty(result)) {
            return result;
        }

        return false;
    } catch (err) {
        return false;
    }
}

export const isNumeric = (value: any): boolean => {
    return (
        value === undefined ||
        value === null ||
        !isNaN(Number(value.toString()))
    );
};

export const isDomainAddress = (value: string): boolean => {  
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value) || value.includes('localhost')) {
        return false;
    }

    return true;
};

export const isEmpty = (value: any): boolean => {
    return (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim().length === 0) ||
        (typeof value === 'number' && value < 1)
    );
}

export const maskSensitiveData = (data: Record<string, any>): Record<string, any> => {
    let sensitiveKeys: string[] = ['secret', 'password'];

    for (let [key, val] of Object.entries(data)) {
        if (sensitiveKeys.includes(key.toLowerCase()) && typeof val === 'string') {
            data[key] = val.replace(/./g, '*');
        }
    }

    return data;
}