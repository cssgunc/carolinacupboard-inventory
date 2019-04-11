let express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service");

router.post('/', async function(req, res, next) {
    try {
        let name = req.body.name;
        let barcode = req.body.barcode;
        let description = req.body.description;
        let count = req.body.count;

        await itemService.createItem(name, barcode, description, count);
    } catch(e)  {
        console.error(`Item could not be saved: ${e.stack}`);
    }

    res.render("admin/entry-manual.ejs");
});

router.get('/', async function(req, res, next) {
    try {
        let items = await itemService.getItems();
    } catch(e)  {
        next(e);
    }
});

module.exports = router;