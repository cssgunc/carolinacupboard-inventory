let express = require("express"),
    router = express.Router(),
    authService = require("../services/authorization-service"),
    tranService = require("../services/transaction-service");
    exceptionHandler = require("../exceptions/exception-handler");

router.get('/', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    let response = {};
    try {
        response.transactions = await tranService.getAllTransactions();
    }
    catch(e) {
        response.error = e;
    }
    res.render('admin/admin-transactions.ejs', {response: response, onyen: onyen, userType: userType    });
});

module.exports = router;