const express = require("express"),
    router = express.Router(),
    url = require('url'),
    itemService = require("../services/item-service"),
    userService = require("../services/user-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsVolunteer = require("./util/auth.js").userIsVolunteer;

const MANUAL_UPDATE_SUCCESS_MESSAGE = "Item successfully updated!";
const MANUAL_UPDATE_ERROR_MESSAGE = "Error updating item.";

router.get("/", [userIsVolunteer], async function (req, res) {
    let response = {};
    res.render("admin/entry.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.get("/search", [userIsVolunteer], async function (req, res) {
    let response = {};
    if (req.query.prevOnyen) response.prevOnyen = req.query.prevOnyen;
    try {
        response.items = await itemService.getItems(null, null);
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("admin/entry-search.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/search', [userIsVolunteer], async function (req, res) {
    let response = {};
    try {
        let searchTerm = req.body.searchTerm === '' ? null : req.body.searchTerm;
        let barcode = req.body.barcode === '' ? null : req.body.barcode;
        response.items = await itemService.getItems(searchTerm, barcode);
        res.render("admin/entry-search.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
        res.render("admin/entry-search.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
    }
});

router.get("/manual", [userIsVolunteer], async function (req, res) {
    response = {};

    // this success field is passed back by a redirect from /entry/manual/update
    // allows us to give the user feedback for their update
    if (req.query.success) {
        response.success = req.query.success;
        if (response.success === "0") {
            response.infoMessage = MANUAL_UPDATE_ERROR_MESSAGE;
        } else if (response.success === "1") {
            response.infoMessage = MANUAL_UPDATE_SUCCESS_MESSAGE;
        }
    }

    let foundItem = {
        name: req.query.name,
        barcode: req.query.barcode,
        desc: req.query.decr
    };

    res.render("admin/entry-manual.ejs", { response: response, foundItem: foundItem, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/manual', [userIsVolunteer], async function (req, res) {
    let response = {};
    try {
        let name = req.body.name;
        let barcode = req.body.barcode === "" ? null : req.body.barcode;
        let description = req.body.description;
        let count = parseInt(req.body.count);

        if (barcode || name) {
            // try searching by barcode, then by name and desc
            let item = await itemService.getItemByBarcodeThenNameDesc(barcode, name, description);

            // if the item is found, we send back a message and the found item
            if (item) {
                response.itemFound = item;
                res.render("admin/entry-manual.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
                return;
            }
        }

        let item = await itemService.createItem(name, barcode, description, count);
        if (item) {
            response.success = '1';
            response.infoMessage = 'New item successfully created, id: ' + item.id;
        } else {
            response.success = '0';
            response.infoMessage = 'Failed to create new item. Please try again later.'
        }
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("admin/entry-manual.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post("/manual/update", [userIsVolunteer], async function (req, res) {
    let id = req.body.id;
    let quantity = parseInt(req.body.quantity);

    try {
        if (quantity > 0) {
            console.log("Add");
            await itemService.addItems(id, quantity, res.locals.onyen, res.locals.onyen);
        } else if (quantity < 0) {
            console.log("Remove");
            await itemService.removeItems(id, -quantity, res.locals.onyen, res.locals.onyen);
        }
        else {
            res.redirect(url.format({
                pathname: "/entry/manual",
                query: {
                    "success": "0"
                }
            }));
            return;
        }
        res.redirect(url.format({
            pathname: "/entry/manual",
            query: {
                "success": "1"
            }
        }));
    } catch (e) {
        console.error(e);
        res.redirect(url.format({
            pathname: "/entry/manual",
            query: {
                "success": "0"
            }
        }));
    }
});

router.post("/add", [userIsVolunteer], async function (req, res) {
    let id = req.body.id;
    let quantity = parseInt(req.body.quantity);

    if (quantity > 0) {
        await itemService.addItems(id, quantity, res.locals.onyen, res.locals.onyen);
    }

    res.redirect(url.format({
        pathname: "/entry/search"
    }));
});

router.post("/remove", [userIsVolunteer], async function (req, res) {
    let response = {};

    let id = req.body.id;
    let onyen = req.body.onyen;
    let quantity = parseInt(req.body.quantity);

    if (quantity > 0) {
        await itemService.removeItems(id, quantity, onyen, res.locals.onyen);
    }

    let user = await userService.getUser(onyen);

    if (!user) {
        user = await userService.createUser(onyen, 'user', null, null);
    }
    if (!user.get('pid') || !user.get('email')) {
        response.onyen = onyen;
        response.pid = user.get('pid');
        response.email = user.get('email');
        res.render('admin/entry-update-info.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType })
        return;
    }

    res.redirect(url.format({
        pathname: "/entry/search",
        query: {
            "prevOnyen": onyen
        }
    }));
});

router.post("/remove/update", [userIsVolunteer], async function (req, res) {
    let response = {};

    let onyen = req.body.onyen;
    let pid = req.body.pid;
    let email = req.body.email;
    
    if (!pid || !email) {
        response.onyen = onyen;
        response.pid = pid;
        response.email = email;
        response.error = "Please input both a PID and an email address."
        res.render('admin/entry-update-info.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType })
    } else {
        try {
            await userService.editUser(onyen, null, pid, email);
        } catch (e) {
            throw exceptionHandler.retrieveException(e);
        }

        res.redirect(url.format({
            pathname: "/entry/search",
            query: {
                "prevOnyen": onyen
            }
        }));
    }
});

router.post("/edit", [userIsVolunteer], async function (req, res) {
    let response = {};

    let id = req.body.id;
    let name = req.body.name;
    let barcode = req.body.barcode === '' ? null : req.body.barcode;
    let description = req.body.description; 
    try {
        let item = await itemService.editItem(id, name, barcode, description);
        console.log(item);
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }
    res.redirect("/entry/search");
});

router.get('/import', [userIsVolunteer], async function (req, res, next) {
    let response = {};
    res.render('admin/entry-import.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/import', [userIsVolunteer], async function (req, res, next) {
    let response = {};

    if (req.files != null) {
        let file = req.files.file;
        if (!file.name.match(/\.csv$/i)) {
            response.failMessage = "Please upload a valid CSV file";
        }
        else {
            await itemService.appendCsv(file).then((result) => {
                if (result) response.successMessage = "Success!";
                else response.failMessage = "An error occurred with the CSV file. The error message can be found in the console.";
            }).catch((e) => {
                response.failMessage = "An error occurred with the CSV file. The error message can be found in the console.";
            });
        }
    }
    else response.failMessage = "Please select a CSV file to upload"; // user never selected a file

    res.render('admin/entry-import.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;