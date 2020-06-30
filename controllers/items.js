const express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service"),
    preorderService = require("../services/preorder-service"),
    authService = require("../services/authorization-service")
exceptionHandler = require("../exceptions/exception-handler"),
    userIsAuthenticated = require("./util/auth.js").userIsAuthenticated;

router.get('/', [userIsAuthenticated], async function (req, res, next) {
    let response = {};
    try {
        response.items = await itemService.getItems(null, null);
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("user/view-items.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/add', [userIsAuthenticated], async function (req, res, next) {
    let itemId = req.body.id;
    let itemName = req.body.name;
    let quantity = req.body.quantity;

    preorderService.createPreorder(itemId, quantity, res.locals.onyen);

    let response = { "itemName": itemName, "quantity": quantity, "success": true };

    res.render("user/preorder-confirm.ejs", { response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;