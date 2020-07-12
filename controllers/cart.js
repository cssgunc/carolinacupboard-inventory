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
router.post('/', [userIsBasicUser], async function(req, res, next) {
    let response = {};
    let cart = JSON.parse(req.body.cart);
    
    try{
        let success = await preorderService.createPreorder(cart, res.locals.onyen);
        if (success) {
            response.success = 'Your preorder has been successfully placed! Visit Carolina Cupboard to pickup your items within the next 24 hours.';
        } else {
            response.error = 'Unknown error occurred. Please try again later or contact Carolina Cupboard staff.';
        }
    } catch(e) {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render('user/cart.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;