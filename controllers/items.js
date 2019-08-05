let express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service"),
    authService = require("../services/authorization-service")
    exceptionHandler = require("../exceptions/exception-handler");

router.post('/', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
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
    // delete req.session.cart;
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

router.post('/search', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
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

router.post('/add', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);

    let itemId = req.body.id;
    let itemName = req.body.name;
    let quantity = req.body.quantity;

    if(req.session.cart) {
        req.session.cart.set(itemId, req.session.cart.get(itemId) + quantity);
    } else {
        req.session.cart = new itemService.CartMap();
        req.session.cart.set(itemId, quantity);
    }

    // Check if quantity in cart is less than inventory count
    let item = await itemService.getItem(itemId);
    if(req.session.cart.get(itemId) > item.count) {
        req.session.cart.set(itemId, req.session.cart.get(itemId) - quantity);
    }

    if (req.session.cart.get(itemId) === 0) {
        req.session.cart.delete(itemId);
    }

    console.log(req.session.cart);

    let response = {"itemName": itemName, "quantity": quantity, "success": true};

    res.render("user/add-confirm.ejs",{response, onyen: onyen, userType: userType});
});

module.exports = router;