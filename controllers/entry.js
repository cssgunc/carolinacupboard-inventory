let express = require("express"),
    router = express.Router(),
    itemService = require("../services/item-service"),
    authService = require("../services/authorization-service")
    exceptionHandler = require("../exceptions/exception-handler");

router.get("/", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);

    res.render("admin/entry.ejs", {onyen: onyen, userType: userType});
});

router.get("/quick", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    res.render("admin/entry-quick.ejs", {onyen: onyen, userType: userType});
});
  
router.get("/search", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);

    let response = {};
    try {
        response.items = await itemService.getItems(null, null);
    } catch(e)  {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("admin/entry-search.ejs", {response: response, onyen: onyen, userType: userType});
});
  
router.get("/manual", async function(req, res) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    res.render("admin/entry-manual.ejs", {response: null, onyen: onyen, userType: userType});
});

router.post("/add", async function(req, res) {
    // let onyen = req.header("uid");
    let onyen = 'austinyw';
    let userType = await authService.getUserType(onyen);
    
    let id  = req.body.id;
    let name = req.body.name;
    let barcode = req.body.barcode;
    let quantity = req.body.quantity;

    if(quantity > 0) {
        itemService.addItems(id, quantity, onyen, onyen);
    }

    res.redirect('back');
});

router.post("/remove", async function(req, res) {
    // let onyen = req.header("uid");
    let onyen = 'austinyw';
    let userType = await authService.getUserType(onyen);
    
    let id  = req.body.id;
    let name = req.body.name;
    let barcode = req.body.barcode;
    let quantity = req.body.quantity;

    if(quantity > 0) {
        itemService.removeItems(id, quantity, onyen, onyen);
    }

    res.redirect('back');
});

module.exports = router;