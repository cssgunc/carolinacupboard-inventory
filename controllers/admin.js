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

/**
 * Route serving the admin home page
 */ 
router.get('/', [userIsAdmin], async function (req, res, next) {
    let response = {};
    res.render("admin/admin.ejs", { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route serving the view of all users in the system
 */
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

/**
 * Route receiving form for new user creation
 */
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

/**
 * Route receiving form for editing user information
 */
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

/**
 * Route receiving form to delete user
 */
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

/**
 * Route serving view of history for all transactions
 */
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

/**
 * Route receiving CSV import for users
 */
router.post('/users/import', [userIsAdmin], async function (req, res, next) {
    let response = {};

    if (req.files != null) {
        let file = req.files.file;
        if (!file.name.match(/\.csv$/i)) {
            response.error = "Please upload a valid CSV file";
        }
        else {
            try {
                let result = await userService.appendCsvUsers(file);
                if (result) response.success = "CSV file successfully imported!";
                else response.error = "An unknown error occurred.";
    
            } catch (e) {
                response.error = exceptionHandler.retrieveException(e);
            }
        }
    }
    else response.error = "Please select a CSV file to upload"; // user never selected a file

    res.render('admin/admin-users-import.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route serving page for backup and deletion of tables
 */
router.get('/backup', [userIsAdmin], async function (req, res, next) {
    let response = {};
    res.render('admin/admin-backup.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route serving a CSV copy of the Items table
 */
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

/**
 * Route serving a CSV copy of the Transactions table
 */
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

/**
 * Route serving a CSV copy of the Downloads table
 */
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

/**
 * Route receiving request to delete the Items table
 */
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

/**
 * Route receiving request to delete out of stock items from the Items table
 */
router.post('/delete/items/outofstock', [userIsAdmin], async function (req, res, next) {
    let response = {};
    try {
        await itemService.deleteOutOfStock();
        response.success = 'Success! All out of stock items have been deleted.';
    } catch (e) {
        if (e.name === "SequelizeForeignKeyConstraintError") {
            response.error = "You tried to delete an item that exists in a transaction! You must backup and delete the transactions first.";
        } else {
            response.error = "Error deleting table. " + exceptionHandler.retrieveException(e);
        }
    }
    res.render('admin/admin-delete-confirm.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route receiving request to delete the Transactions table
 */
router.post('/delete/transactions', [userIsAdmin], async function (req, res, next) {
    let response = {};
    try {
        await tranService.deleteAllTransactions();
        response.success = 'Success! All transactions have been deleted.';
    } catch (e) {
        response.error = "Error deleting table. " + exceptionHandler.retrieveException(e);
    }
    res.render('admin/admin-delete-confirm.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route receiving request to delete the Users table
 */
router.post('/delete/users', [userIsAdmin], async function (req, res, next) {
    let response = {};
    try {
        await userService.deleteAllUsers();
        response.success = 'Success! All users have been deleted.';
    } catch (e) {
        if (e.name === "SequelizeForeignKeyConstraintError") {
            response.error = "You tried to delete a user that exists in a transaction! You must backup and delete the transactions first.";
        } else {
            response.error = "Error deleting table. " + exceptionHandler.retrieveException(e);
        }
    }
    response.success = true;
    res.render('admin/admin-delete-confirm.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route serving page to clear and re-init the database
 */
router.get('/database', [userIsAdmin], async function (req, res, next) {
    let response = {};
    res.render('admin/admin-database.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

/**
 * Route receiving request to clear and re-init the database
 */
router.post('/database', [userIsAdmin], async function (req, res, next) {
    let response = {};
    try {
        await dbUtil.dropTables(false);
        await dbUtil.createTables(false);
        await dbUtil.initAdmin(false);
        response.success = 'Success! All data has been deleted.';
    } catch (e) {
        response.error = 'Sorry, there was an error with your request. Please contact an administrator. ' + exceptionHandler.retrieveException(e);
    }
    res.render('admin/admin-database.ejs', { response: response, onyen: res.locals.onyen, userType: res.locals.userType });
});

module.exports = router;