let express = require("express"),
    router = express.Router(),
    authService = require("../services/authorization-service"),
    tranService = require("../services/transaction-service"),
    itemService = require("../services/item-service"),
    preorderService = require("../services/preorder-service"),
    exceptionHandler = require("../exceptions/exception-handler");

router.get('/', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    let response = {};

    response.preorders = await preorderService.getAllPreorders();
    for(const t of response.preorders) {
        t['item_name'] = (await itemService.getItem(t['item_id']))['name'];
        t['count'] = -t['count'];
    }

    res.render('admin/approve.ejs', {response: response, onyen: onyen, userType: userType});
});

module.exports = router;