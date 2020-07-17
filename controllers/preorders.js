const { response } = require("express");

const express = require("express"),
    router = express.Router(),
    preorderService = require("../services/preorder-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsVolunteer = require("./util/auth.js").userIsVolunteer;

/**
 * Route serving volunteer preorder management view
 */
router.get('/', [userIsVolunteer], async function (req, res, next) {
    let response = {};
    response.preorders = await preorderService.getAllPreorders();
    // Negates negative counts because it's implied in the preorder management view
    for (const t of response.preorders) {
        t['count'] = -t['count'];
    }

    res.render('volunteer/preorders.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route receiving form to confirm a preorder
 * Expects a transaction id in request body
 */
router.post('/complete', [userIsVolunteer], async function (req, res, next) {
    let response = {};
    let id = req.body.id;

    try {
        await preorderService.completePreorder(id, res.locals.onyen);
        response.success = "Success! Preorder successfully resolved.";
    } catch (e) {
        response.error = "Sorry, there was an error with your request. Please try again later. " + exceptionHandler.retrieveException(e);
    }

    res.render('volunteer/preorders-result.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route receiving form to cancel a preorder
 * Expects a transaction id in request body
 */
router.post('/cancel', [userIsVolunteer], async function (req, res, next) {
    let response = {};
    let id = req.body.id;

    try {
        await preorderService.cancelPreorder(id, res.locals.onyen);
        response.success = "Success! Preorder successfully resolved.";
    } catch (e) {
        response.error = "Sorry, there was an error with your request. Please try again later. " + exceptionHandler.retrieveException(e);
    }

    res.render('volunteer/preorders-result.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;