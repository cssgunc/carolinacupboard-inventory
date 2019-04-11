let express = require("express"),
    router = express.Router();

router.get('/', async function (req, res) {
    const code = req.query.code;
    const url = "https://www.datakick.org/api/items/" + code;
    request.get(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            return res.send(body);
        }
        return res.send('ERROR: ' + error.message);
    });
});

module.exports = router;