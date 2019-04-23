let express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service"),
    authService = require("../services/authorization-service")
    exceptionHandler = require("../exceptions/exception-handler");

router.post('/', async function(req, res, next) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    let response = {};
    try {
        let name = req.body.name;
        let barcode = req.body.barcode;
        let description = req.body.description;
        let count = req.body.count;

        await itemService.createItem(name, barcode, description, count);
    } catch(e)  {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("admin/entry-manual.ejs", {response: response, onyen: onyen, userType: userType});
});

router.get('/', async function(req, res, next) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    let response = {};
    try {
        response.items = await itemService.getItems(null, null);
    } catch(e)  {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("admin/view-items.ejs",{response: response, onyen: onyen, userType: userType});
});

router.post('/search', async function(req, res, next) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    let response = {};
    try {
        let name = req.body.name === '' ? null : req.body.name;
        let barcode = req.body.barcode === '' ? null : req.body.barcode;

        response.items = await itemService.getItems(name, barcode);
    } catch(e)  {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("user/view-items.ejs",{response: response, onyen: onyen, userType: userType});
});

module.exports = router;