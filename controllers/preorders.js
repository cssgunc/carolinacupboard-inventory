const { response } = require("express");

const express = require("express"),
    router = express.Router(),
    authService = require("../services/authorization-service"),
    itemService = require("../services/item-service"),
    preorderService = require("../services/preorder-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsAuthenticated = require("./util/auth.js").userIsAuthenticated,
    userIsVolunteer = require("./util/auth.js").userIsVolunteer;

router.get('/', [userIsVolunteer], async function (req, res, next) {
    let response = {};
    response.preorders = await preorderService.getAllPreorders();
    for (const t of response.preorders) {
        t['count'] = -t['count'];
    }

    res.render('admin/preorders.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/complete', [userIsVolunteer], async function (req, res, next) {
    let response = {};
    let id = req.body.id;
    console.log("preorder ID: " + id);

    await preorderService.completePreorder(id, res.locals.onyen);

    response.success = true;

    res.render('admin/preorders-result.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/cancel', [userIsVolunteer], async function (req, res, next) {
    let response = {};
    let id = req.body.id;
    let count = req.body.count;

    await preorderService.cancelPreorder(id, res.locals.onyen);

    response.success = true;

    res.render('admin/preorders-result.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;