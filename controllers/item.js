let express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service"),
    exceptionHandler = require("../exceptions/exception-handler");

router.post('/', async function(req, res, next) {
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

    res.render("admin/entry-manual.ejs", {response: response});
});

router.get('/', async function(req, res, next) {
    let response = {};
    try {
        response.items = await itemService.getItems();
    } catch(e)  {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("user/view-items.ejs",{response: response});
});

module.exports = router;