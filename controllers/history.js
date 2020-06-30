const express = require("express"),
    router = express.Router(),
    tranService = require("../services/transaction-service"),
    itemService = require("../services/item-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsAuthenticated = require("./util/auth.js").userIsAuthenticated;

router.get('/', [userIsAuthenticated], async function (req, res, next) {
    let response = {};
    try {
        response.transactions = await tranService.getUserPurchaseHistory(res.locals.onyen);
        for (const t of response.transactions) {
            t['item_name'] = (await itemService.getItem(t['item_id']))['name'];
            t['count'] = -t['count'];
        }

    }
    catch (e) {
        response.error = e;
        throw e;
    }
    res.render('user/history.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;