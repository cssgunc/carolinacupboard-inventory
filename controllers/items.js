let express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service"),
    preorderService = require("../services/preorder-service"),
    authService = require("../services/authorization-service")
    exceptionHandler = require("../exceptions/exception-handler");

router.get('/', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    let response = {};
    try {
        response.items = await itemService.getItems(null, null);
    } catch(e)  {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("user/view-items.ejs",{response: response, onyen: onyen, userType: userType});
});

router.post('/add', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);

    let itemId = req.body.id;
    let itemName = req.body.name;
    let quantity = req.body.quantity;

    preorderService.createPreorder(itemId, quantity, onyen);

    let response = {"itemName": itemName, "quantity": quantity, "success": true};

    res.render("user/preorder-confirm.ejs",{response, onyen: onyen, userType: userType});
});

module.exports = router;