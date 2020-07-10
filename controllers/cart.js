const express = require("express"),
    router = express.Router(),
    preorderService = require("../services/preorder-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsBasicUser = require('./util/auth').userIsBasicUser;

/*
GET /cart
Renders view of the user's current cart
*/
router.get('/', [userIsBasicUser], function(req, res, next) {
    let response = {};

    res.render('user/cart.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/*
POST /cart
Receives an array of items with quantities, creates a new transaction group, creates transactions for each item
Renders view with status of check out procedure
*/
router.post('/', [userIsBasicUser], function(req, res, next) {
    let response = {};
    let cart = JSON.parse(req.body.cart);
    // console.log(cart);
    // preorderService.createPreorder(res.locals.onyen, cart);

    res.send(JSON.stringify(cart));
    //    res.render('user/cart.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType })
});

module.exports = router;