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

    res.render('admin/preorders.ejs', {response: response, onyen: onyen, userType: userType});
});

router.post('/complete', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    let response = {};

    let id = req.body.id;

    await preorderService.completePreorder(id, onyen);

    response.success = true;

    res.render('admin/preorders-result.ejs', {response: response, onyen: onyen, userType: userType});
});

router.post('/cancel', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    let response = {};

    let id = req.body.id;
    let count = req.body.count;

    await preorderService.cancelPreorder(id, onyen, count);

    response.success = true;;

    res.render('admin/preorders-result.ejs', {response: response, onyen: onyen, userType: userType});
});

module.exports = router;