function response(result) {
    const ERROR_CODE = 400;
    const SUCESS_CODE = 200;
    const ERROR_FLAG = 'N';
    const SUCESS_FLAG = 'S';

    res = new Object();
    data = new Object();
    status = new Object()

    if (result.flag == SUCESS_FLAG) {
        httpCode = SUCESS_CODE;
        flag = SUCESS_FLAG;
        message = '';
        payload = result.data;


    } else {
        httpCode = ERROR_CODE;
        flag = ERROR_FLAG;
        message = result.error;
        payload = '';
    }

    status.flag = flag;
    status.message = message;

    data.status = status;
    data.payload = payload;


    res.httpCode = httpCode;
    res.data = JSON.stringify(data)

    return res;
}

module.exports = { response };