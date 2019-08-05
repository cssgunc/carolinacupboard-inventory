let express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service"),
    authService = require("../services/authorization-service")
    exceptionHandler = require("../exceptions/exception-handler");

router.get('/', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    let response = {};
    if(req.session.cart) {
        response.cart = req.session.cart;
    }

    console.log(req.session.cart);

    res.render("user/cart.ejs",{response: response, onyen: onyen, userType: userType});
});

module.exports = router;