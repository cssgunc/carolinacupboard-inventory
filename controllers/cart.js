const express = require("express"),
    router = express.Router(),
    preorderService = require("../services/preorder-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsBasicUser = require('./util/auth').userIsBasicUser;

router.get('/', [userIsBasicUser], function(req, res, next) {
    let response = {};

    res.render('user/cart.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/cart', [userIsBasicUser], function(req, res, next) {
   let response = {};
   let cart = JSON.parse(req.body.cart);

   res.render('user/cart.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType })
});

module.exports = router;