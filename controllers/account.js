const { response } = require("express");

const express = require("express"),
    router = express.Router(),
    userService = require("../services/user-service"),
    exceptionHandler = require("../exceptions/exception-handler");

// Page for new users to update their PID and email
router.get('/update', async function (req, res, next) {
    let response = {};
    if (!res.locals.userType) res.locals.userType = 'user';
    if (res.locals.firstTime) response.firstTime = true; // Passed by userHasInfo middleware for first time visitors
    try {
        let user = await userService.getUser(res.locals.onyen);
        if (user) {
            response.pid = user.get('pid');
            response.email = user.get('email');
        }
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }
    res.render("update-account.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});


router.post('/update', async function (req, res, next) {
    let response = {};
    try {
        let users = await userService.upsertUser(res.locals.onyen, res.locals.userType, req.body.pid, req.body.email);
        response.pid = users[0].get('pid');
        response.email = users[0].get('email');
        response.success = 'Information successfully updated!';
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("update-account.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;