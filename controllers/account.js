const express = require("express"),
    router = express.Router(),
    userService = require("../services/user-service"),
    exceptionHandler = require("../exceptions/exception-handler");

// Page for new users to update their PID and email
router.get('/update', async function (req, res, next) {
    if (!res.locals.userType) res.locals.userType = 'user';
    res.render("request-user-info.ejs", { response: {}, onyen: res.locals.onyen, userType: res.locals.userType });
});


router.post('/update', async function (req, res, next) {
    let response = {};
    try {
        let user = await userService.upsertUser(res.locals.onyen, res.locals.userType, req.body.pid, req.body.email);
        if (user.length === 0 || !user[0]) {
            response.error = "Your PID and/or email failed to send, please try again later";
            res.render("request-user-info.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
            return;
        }
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
        res.render("request-user-info.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
        return;
    }

    res.redirect("/");
});

module.exports = router;