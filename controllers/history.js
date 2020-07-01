const express = require("express"),
    router = express.Router(),
    tranService = require("../services/transaction-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsBasicUser = require('./util/auth').userIsBasicUser;

router.get('/', [userIsBasicUser], async function (req, res, next) {
    let response = {};
    try {
        response.transactions = await tranService.getUserPurchaseHistory(res.locals.onyen);
        for (const t of response.transactions) {
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