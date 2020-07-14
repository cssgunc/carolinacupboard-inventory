const { response } = require("express");

const express = require("express"),
    router = express.Router(),
    userService = require("../services/user-service"),
    authService = require("../services/authorization-service"),
    tranService = require("../services/transaction-service"),
    itemService = require("../services/item-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    userIsAuthenticated = require("./util/auth.js").userIsAuthenticated,
    userIsAdmin = require("./util/auth.js").userIsAdmin,
    dbUtil = require("../db/db-util"),
    copyTo = require('pg-copy-streams').to,
    { Client } = require('pg'),
    fs = require('fs');

// The root of the admin route
// Returns a view with links to other admin views
router.get('/', [userIsAdmin], async function (req, res, next) {
    let response = {};
    res.render("admin/admin.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

// Returns the user view
// Shows a list of all admins and volunteers
router.get('/users', [userIsAdmin], async function (req, res, next) {
    let response = {};
    let types = ["admin", "volunteer", "user", "disabled"];

    try {
        response.users = await userService.getAllUsers();
    } catch (e) {
        response.error = exceptionHandler.retrieveException(e);
    }
    res.render("admin/admin-users.ejs", { response: response, types: types, onyen: res.locals.onyen, userType: res.locals.userType });
});

// Creates a new user of given type
// Redirects to /users
router.post('/users/create', [userIsAdmin], async function (req, res, next) {
    try {
        let newOnyen = req.body.onyen;
        let type = req.body.type;
        let pid = req.body.pid;
        let email = req.body.email;

        if (type === "disabled") {
            res.status(400).send("Can't create a new user that's disabled");
            return;
        }

        await userService.createUser(newOnyen, type, pid, email);
    } catch (e) {
        res.status(500).send("Internal server error");
        return;
    }

    res.redirect('/admin/users');
});

// Changes the given user to the specified type
// Redirects to /users
router.post('/users/edit', [userIsAdmin], async function (req, res, next) {
    try {
        let editOnyen = req.body.onyen;

        // Prevents the PREORDER admin from being edited
        if (editOnyen === "PREORDER") {
            res.status(403).send("Cannot edit PREORDER admin");
            return;
        }
        
        let type = req.body.type;
        let pid = req.body.pid;
        let email = req.body.email;

        // Checks to make sure there are at least two admins in the system
        // PREORDER and one other admin
        let currType = await authService.getUserType(editOnyen);
        if (currType === "admin" && req.body.type !== "admin") {
            let adminCount = await userService.countAllAdmins();
            if (adminCount <= 2) {
                res.status(500).send('Cannot remove the last admin');
                return;
            }
        }
        await userService.editUser(editOnyen, type, pid, email);

    } catch (e) {
        res.status(500).send(exceptionHandler.retrieveException(e));
        return;
    }

    res.redirect('/admin/users');
});

// Deletes the given user
// Redirects to /users
router.post('/users/delete', [userIsAdmin], async function (req, res, next) {
    try {
        let delOnyen = req.body.onyen;

        // Prevents the PREORDER admin from being edited
        if (delOnyen === "PREORDER") {
            res.status(403).send("Cannot delete PREORDER admin");
            return;
        }

        // Checks to make sure there are at least two admins in the system
        // PREORDER and one other admin
        let delType = await authService.getUserType(delOnyen);
        if (delType === "admin") {
            let adminCount = await userService.countAllAdmins();
            if (adminCount <= 2) {
                res.status(500).send('Cannot delete the last admin');
                return;
            }
        }
        await userService.deleteUser(delOnyen);

    } catch (e) {
        res.status(500).send("Internal server error");
        return;
    }

    res.redirect('/admin/users');
});

// Returns a view that shows a table of all transactions
router.get('/history', [userIsAdmin], async function (req, res, next) {
    let response = {};
    try {
        response.transactions = await tranService.getAllTransactions();
    }
    catch (e) {
        response.error = e;
    }
    res.render('admin/admin-transactions.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.get('/users/import', [userIsAdmin], async function (req, res, next) {
    let response = {};
    res.render('admin/admin-users-import.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/users/import', [userIsAdmin], async function (req, res, next) {
    let response = {};

    if (req.files != null) {
        let file = req.files.file;
        if (!file.name.match(/\.csv$/i)) {
            response.failMessage = "Please upload a valid CSV file";
        }
        else {
            await userService.appendCsvUsers(file).then((result) => {
                if (result) response.successMessage = "Success!";
                else response.failMessage = "An error occurred with the CSV file. The error message can be found in the console.";
            }).catch((e) => {
                response.failMessage = "An error occurred with the CSV file. The error message can be found in the console.";
            });
        }
    }
    else response.failMessage = "Please select a CSV file to upload"; // user never selected a file

    res.render('admin/admin-users-import.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

// Returns a view that lets the user backup or clear tables
router.get('/backup', [userIsAdmin], async function (req, res, next) {
    let response = {};
    res.render('admin/admin-backup.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

// Downloads a CSV copy of the Items table
router.get('/backup/items.csv', [userIsAdmin], async function (req, res, next) {
    let data = '';

    let client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    if (process.env.NODE_ENV === 'prod') {
        client.host = process.env.POSTGRESQL_SERVICE_HOST;
        client.port = process.env.POSTGRESQL_SERVICE_PORT;
    }

    client.connect(function (pgErr, client, done) {
        if (pgErr) {
            console.log(pgErr);
            res.sendStatus(500);
        }
        var stream = client.query(copyTo(`COPY (SELECT * FROM items) TO STDOUT With CSV HEADER`));
        stream.on('data', chunk => {
            data += chunk;
        })
        stream.on('end', response => {
            done;
            res.set('Content-Type', 'text/csv');
            res.send(data);
        });
        stream.on('error', err => {
            done;
            console.log(err);
            res.sendStatus(500);
        })
    });
});

// Downloads a CSV copy of the Transactions table
router.get('/backup/transactions.csv', [userIsAdmin], async function (req, res, next) {
    let data = '';

    let client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    if (process.env.NODE_ENV === 'prod') {
        client.host = process.env.POSTGRESQL_SERVICE_HOST;
        client.port = process.env.POSTGRESQL_SERVICE_PORT;
    }

    client.connect(function (pgErr, client, done) {
        if (pgErr) {
            console.log(pgErr);
            res.sendStatus(500);
        }
        var stream = client.query(copyTo(`COPY (SELECT * FROM transactions) TO STDOUT With CSV HEADER`));
        stream.on('data', chunk => {
            data += chunk;
        })
        stream.on('end', response => {
            done;
            res.set('Content-Type', 'text/csv');
            res.send(data);
        });
        stream.on('error', err => {
            done;
            console.log(err);
            res.sendStatus(500);
        })
    });
});

// Downloads a CSV copy of the Users table
router.get('/backup/users.csv', [userIsAdmin], async function (req, res, next) {
    let data = '';

    let client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    if (process.env.NODE_ENV === 'prod') {
        client.host = process.env.POSTGRESQL_SERVICE_HOST;
        client.port = process.env.POSTGRESQL_SERVICE_PORT;
    }

    client.connect(function (pgErr, client, done) {
        if (pgErr) {
            console.log(pgErr);
            res.sendStatus(500);
        }
        var stream = client.query(copyTo(`COPY (SELECT * FROM users) TO STDOUT With CSV HEADER`));
        stream.on('data', chunk => {
            data += chunk;
        })
        stream.on('end', response => {
            done;
            res.set('Content-Type', 'text/csv');
            res.send(data);
        });
        stream.on('error', err => {
            done;
            console.log(err);
            res.sendStatus(500);
        })
    });
});

router.post('/delete/items/all', [userIsAdmin], async function (req, res, next) {
    let response = { 'table': 'items' };
    try {
        await itemService.deleteAllItems();
        response.success = true;
    } catch (e) {
        if (e.name === "SequelizeForeignKeyConstraintError") {
            response.success = false;
            response.error = "You tried to delete an item that exists in a transaction! You must backup and delete the transactions first.";
        } else {
            response.success = false;
            response.error = "Unknown Error!";
        }
    }
    res.render('admin/admin-delete-confirm.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/delete/items/outofstock', [userIsAdmin], async function (req, res, next) {
    let response = { 'table': 'out of stock items' };
    try {
        await itemService.deleteOutOfStock();
        response.success = true;
    } catch (e) {
        if (e.name === "SequelizeForeignKeyConstraintError") {
            response.success = false;
            response.error = "You tried to delete an item that exists in a transaction! You must backup and delete the transactions first.";
        } else {
            response.success = false;
            response.error = "Unknown Error!";
        }
    }
    res.render('admin/admin-delete-confirm.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/delete/transactions', [userIsAdmin], async function (req, res, next) {
    let response = { 'table': 'transactions' };
    await tranService.deleteAllTransactions();
    response.success = true;
    res.render('admin/admin-delete-confirm.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/delete/users', [userIsAdmin], async function (req, res, next) {
    let response = { 'table': 'users' };
    try {
        await userService.deleteAllUsers();
        response.success = true;
    } catch (e) {
        if (e.name === "SequelizeForeignKeyConstraintError") {
            response.success = false;
            response.error = "You tried to delete a user that exists in a transaction! You must backup and delete the transactions first.";
        } else {
            response.success = false;
            response.error = "Unknown Error!";
        }
    }
    response.success = true;
    res.render('admin/admin-delete-confirm.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.get('/database', [userIsAdmin], async function (req, res, next) {
    let response = {};
    res.render('admin/admin-database.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

router.post('/database', [userIsAdmin], async function (req, res, next) {
    let response = {};
    try {
        await dbUtil.dropTables(false);
        await dbUtil.createTables(false);
        await dbUtil.initAdmin(false);
        response.success = 1;
    } catch (e) {
        response.success = 0;
    }
    res.render('admin/admin-database.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;