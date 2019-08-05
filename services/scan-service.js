const request = require('request');

exports.scan = async function(barcode) {
    let result = null;
    const url = "https://www.datakick.org/api/items/" + barcode;
    console.log(url);
    await request.get(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            result = body;
            return result;
        }
    });
    return result;
}