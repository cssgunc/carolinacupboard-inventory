const express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service"),
    preorderService = require("../services/preorder-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsAuthenticated = require("./util/auth").userIsAuthenticated,
    userIsBasicUser = require('./util/auth').userIsBasicUser;

router.get('/', [userIsBasicUser], async function (req, res, next) {
    let response = {};
    try {
        response.items = await itemService.getItems(null, null);
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("user/view-items.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/add', [userIsBasicUser], async function (req, res, next) {
    let response = {};

    let itemId = req.body.id;
    let itemName = req.body.name;
    let quantity = req.body.quantity;

    try {
        await preorderService.createPreorder(itemId, quantity, res.locals.onyen);
        response.success = "Success! We've added " + quantity + " count(s) of " + itemName + " to your cart.";
    } catch (e) {
        response.error = "An error occurred: " + exceptionHandler.retrieveException(e);
    }

    res.render("user/preorder-confirm.ejs", { response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;