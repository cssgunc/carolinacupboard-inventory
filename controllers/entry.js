const express = require("express"),
    router = express.Router(),
    url = require('url'),
    itemService = require("../services/item-service"),
    userService = require("../services/user-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsVolunteer = require("./util/auth.js").userIsVolunteer;

const MANUAL_UPDATE_SUCCESS_MESSAGE = "Item successfully updated!";
const MANUAL_UPDATE_ERROR_MESSAGE = "Error updating item.";

/**
 * Route serving homepage for item entry
 */
router.get("/", [userIsVolunteer], async function (req, res) {
    let response = {};
    res.render("volunteer/entry.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route serving page for item entry table
 */
router.get("/search", [userIsVolunteer], async function (req, res) {
    let response = {};
    if (req.query.prevOnyen) response.prevOnyen = req.query.prevOnyen;
    try {
        response.items = await itemService.getAllItems();
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("volunteer/entry-search.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route serving page for manual item entry
 */
router.get("/manual", [userIsVolunteer], async function (req, res) {
    response = {};

    // this success field is passed back by a redirect from /entry/manual/update
    // allows us to give the user feedback for their update
    let success = req.query.success;
    if (success) {
        if (success === "0") {
            response.error = MANUAL_UPDATE_ERROR_MESSAGE;
        } else if (success === "1") {
            response.success = MANUAL_UPDATE_SUCCESS_MESSAGE;
        }
    }

    response.foundItem = {
        name: req.query.name,
        barcode: req.query.barcode,
        desc: req.query.decr
    };

    res.render("volunteer/entry-manual.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route receiving form for new manual item creation
 * Expects item name, barcode, description, and count in request body
 * If the item exists, we pass the existing item back to the view
 * Else we create a new item
 */
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
                res.render("volunteer/entry-manual.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
                return;
            }
        }

        let item = await itemService.createItem(name, barcode, description, count);
        if (item) {
            response.success = 'New item successfully created, id: ' + item.id;
        } else {
            response.error = 'Failed to create new item. Please try again later.'
        }
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }

    res.render("volunteer/entry-manual.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route receiving form to update an existing item
 * Expects an item id and quantity in request body
 * Updates the item and then redirects back to /manual with query params to signal success or error
 */
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

/**
 * Route receiving quantity to add to an existing item
 * Expects an item id and quantity in request body
 * Redirects to /entry/search
 */
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

/**
 * Route receiving quantity to remove from an existing item
 * Expects an item id, visitor onyen, and quantity in request body
 * If the visitor onyen is not in the user database, or their account info is not filled out
 * the volunteer is shown a view to update this info
 * Redirects to /entry/search
 */
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
    // If user is missing account info, render a view for the volunteer to fill out the user's info
    if (!user.get('pid') || !user.get('email')) {
        response.onyen = onyen;
        response.pid = user.get('pid');
        response.email = user.get('email');
        res.render('volunteer/entry-update-info.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType })
        return;
    }

    res.redirect(url.format({
        pathname: "/entry/search",
        query: {
            "prevOnyen": onyen
        }
    }));
});

/**
 * Route receiving updated user info for a new visitor
 * Expects visitor onyen, pid, and email address in request body
 * Redirects to /entry/search
 */
router.post("/remove/update", [userIsVolunteer], async function (req, res) {
    let response = {};

    let onyen = req.body.onyen;
    let pid = req.body.pid;
    let email = req.body.email;
    
    // Re-renders form if not enough info is given
    if (!pid || !email) {
        response.onyen = onyen;
        response.pid = pid;
        response.email = email;
        response.error = "Please input both a PID and an email address."
        res.render('volunteer/entry-update-info.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType })
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

/**
 * Route receiving form to edit an item from the table entry view
 * Expects item id, name, barcode, and description in request body
 * Redirects to /entry/search
 */
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

/**
 * Route serving the item CSV import page
 */
router.get('/import', [userIsVolunteer], async function (req, res, next) {
    let response = {};
    res.render('volunteer/entry-import.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route receiving a CSV file upload for item import
 * expects CSV file in request files
 */
router.post('/import', [userIsVolunteer], async function (req, res, next) {
    let response = {};

    if (req.files != null) {
        let file = req.files.file;

        // If not a CSV file, set response error
        if (!file.name.match(/\.csv$/i)) {
            response.error = "Please upload a valid CSV file";
        } else {
            try {
                let result = await itemService.appendCsv(file);
                if (result) response.success = "CSV file successfully imported!";
                else response.error = "An unknown error occurred.";
            } catch (e) {
                response.error = "An error occurred with the CSV file. The error message can be found in the console.";
            }
        }
    }
    else response.error = "Please select a CSV file to upload"; // user never selected a file

    res.render('volunteer/entry-import.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;