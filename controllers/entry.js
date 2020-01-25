let express = require("express"),
    request = require('request'),
    router = express.Router(),
    url = require('url'),
    itemService = require("../services/item-service"),
    authService = require("../services/authorization-service"),
    exceptionHandler = require("../exceptions/exception-handler");

router.get("/", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin" && userType !== "volunteer") res.sendStatus(403);
    
    res.render("admin/entry.ejs", {onyen: onyen, userType: userType});
});

router.get("/quick", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin" && userType !== "volunteer") res.sendStatus(403);

    res.render("admin/entry-quick.ejs", {onyen: onyen, userType: userType});
});
  
router.get("/search", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin" && userType !== "volunteer") res.sendStatus(403);

    let response = {};
    if(req.query.prevOnyen) response.prevOnyen = req.query.prevOnyen;
    try {
        response.items = await itemService.getItems(null, null);
    } catch(e)  {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("admin/entry-search.ejs", {response: response, onyen: onyen, userType: userType});
});

router.post('/search', async function (req, res) {
    console.log("searchCTRL");
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin" && userType !== "volunteer") res.sendStatus(403);
    
    let response = {};
    try {
        let searchTerm = req.body.searchTerm === '' ? null : req.body.searchTerm;
        let barcode = req.body.barcode === '' ? null : req.body.barcode;
        response.items = await itemService.getItems(searchTerm, barcode);
        if(barcode && (response.items === undefined || response.items.length == 0)) {
            const url = "https://www.datakick.org/api/items/" + barcode;
            console.log(url);
            await request.get(url, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    response.scanResult = JSON.parse(body);
                    console.log(response.scanResult);
                }
                res.render("admin/entry-search.ejs",{response: response, onyen: onyen, userType: userType});
            });
        }
        else res.render("admin/entry-search.ejs",{response: response, onyen: onyen, userType: userType});
    } catch(e)  {
        response.error = exceptionHandler.retrieveException(e);
    }
});

// , searchCtrl);
  
router.get("/manual", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin" && userType !== "volunteer") res.sendStatus(403);
    let foundItem = {
        name: req.query.name,
        barcode: req.query.barcode,
        desc: req.query.decr
    };

    res.render("admin/entry-manual.ejs", {response: null, foundItem: foundItem, onyen: onyen, userType: userType});
});

router.post("/add", async function(req, res) {
    let volunteer_onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(volunteer_onyen);
    if(userType !== "admin" && userType !== "volunteer") res.sendStatus(403);
    
    let id  = req.body.id;
    let name = req.body.name;
    let barcode = req.body.barcode;
    let quantity = req.body.quantity;

    if(quantity > 0) {
        itemService.addItems(id, quantity, volunteer_onyen, volunteer_onyen);
    }

    res.redirect('/entry/search');
});

router.post("/remove", async function(req, res) {
    let volunteer_onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(volunteer_onyen);
    if(userType !== "admin" && userType !== "volunteer") res.sendStatus(403);

    let id  = req.body.id;
    let name = req.body.name;
    let barcode = req.body.barcode;
    let onyen = req.body.onyen;
    let quantity = req.body.quantity;

    if(quantity > 0) {
        itemService.removeItems(id, quantity, onyen, volunteer_onyen);
    }

    res.redirect(url.format({
        pathname:"/entry/search",
        query: {
           "prevOnyen": onyen
        }
    }));
});

router.post("/found", async function(req, res) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin" && userType !== "volunteer") res.sendStatus(403);
    
    let name = req.body.name;
    let barcode = req.body.barcode;
    let description = req.body.description;

    res.redirect("/entry/manual/?name=" + name + "&barcode=" + barcode + "&desc=" + description);
});

router.get('/import', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        res.render('admin/entry-import.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.post('/import', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        let file = req.files.file;
        if(!file.name.match(/\.csv$/i)) {
            response.failMessage = "Please upload a valid CSV file";
            res.render('admin/entry-import.ejs', {response: response, onyen: onyen, userType: userType});
        }
        else {
            promise = await itemService.appendCsv(file);
            if (promise == null) {
                response.failMessage = "An error occurred with the CSV file. The error message can be found in the console.";
            } else {
                response.successMessage = "Success!";
            }
            res.render('admin/entry-import.ejs', {response: response, onyen: onyen, userType: userType});
        }
    }
});

module.exports = router;