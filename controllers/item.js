let express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service");

router.post('/', async function(req, res, next) {
    try {
        let name = req.body.name;
        let barcode = req.body.barcode;
        let description = req.body.description;

        await itemService.createItem(name, barcode, description);

        res.sendStatus(201);
    } catch(e)  {
        next(e);
    }
});

router.get('/', async function(req, res, next) {
    try {
        let items = await itemService.getItems();
        res.json(items);
    } catch(e)  {
        next(e);
    }
});

module.exports = router;