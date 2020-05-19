let express = require("express"),
    router = express.Router(),
    adminService = require("../services/admin-service"),
    authService = require("../services/authorization-service"),
    tranService = require("../services/transaction-service"),
    itemService = require("../services/item-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    dbUtil = require("../db/db-util"),
    copyTo = require('pg-copy-streams').to,
    {Client} = require('pg'),
    fs = require('fs');

// The root of the admin route
// Returns a view with links to other admin views
router.get('/', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        res.render("admin/admin.ejs", {onyen: onyen, userType: userType});
    }
});

// Returns the user view
// Shows a list of all admins and volunteers
router.get('/users', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    // if(!onyen) res.sendStatus(403);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        let types = ["admin","volunteer"];

        try {
            response.users = await adminService.getAllUsers();
        } catch(e)  {
            response.error = exceptionHandler.retrieveException(e);
        }
        res.render("admin/admin-users.ejs", {response : response, types : types, onyen: onyen, userType: userType});
    }
});

// Creates a new user of given type
// Redirects to /users
router.post('/users/create', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    // if(!onyen) res.sendStatus(403);
    if(userType !== "admin") res.sendStatus(403);
    if(true) {
        try {
            let newOnyen = req.body.onyen;
            let type = req.body.type;

            await adminService.createUser(newOnyen, type);
        } catch(e) {
            res.status(500).send("Internal server error");
            return;
        }

        res.redirect('/admin/users');
    }
});

// Changes the given user to the specified type
// Redirects to /users
router.post('/users/edit', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    // if(!onyen) res.sendStatus(403);
    if(userType !== "admin") res.sendStatus(403);
    else {
        try {
            let editOnyen = req.body.onyen;

            // Prevents the PREORDER admin from being edited
            if (editOnyen === "PREORDER") {
                res.status(403).send("Cannot edit PREORDER admin");
                return;
            }
            let type = req.body.type;

            // Checks to make sure there are at least two admins in the system
            // PREORDER and one other admin
            let currType = await authService.getUserType(editOnyen);
            if(currType === "admin" && req.body.type !== "admin") {
                let adminCount = await adminService.countAllAdmins();
                if(adminCount <= 2) {
                    res.status(500).send('Cannot remove the last admin');
                    return;
                }
            }
            await adminService.changeUserType(editOnyen, type);

        } catch(e) {
            console.error(e);
            res.status(500).send("Internal server error");
            return;
        }

        res.redirect('/admin/users');
    }
});

// Deletes the given user
// Redirects to /users
router.post('/users/delete', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    // if(!onyen) res.sendStatus(403);
    if(userType !== "admin") res.sendStatus(403);
    else {
        try {
            let delOnyen = req.body.onyen;

            // Prevents the PREORDER admin from being edited
            if (delOnyen === "PREORDER") {
                res.status(403).send("Cannot delete PREORDER admin");
                return;
            }
            
            // Checks to make sure there are at least two admins in the system
            // PREORDER and one other admin
            let delType =  await authService.getUserType(delOnyen);
            if(delType === "admin") {
                let adminCount = await adminService.countAllAdmins();
                console.log("Admin count: " + adminCount);
                if(adminCount <= 2) {
                    res.status(500).send('Cannot delete the last admin');
                    return;
                }
            }
            await adminService.deleteUser(delOnyen);

        } catch(e) {
            res.status(500).send("Internal server error");
            return;
        }

        res.redirect('/admin/users');
    }
});

// Returns a view that shows a table of all transactions
router.get('/history', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        try {
            response.transactions = await tranService.getAllTransactions();
            // Transactions only specify the item id, so we have to search the Items table for the item name
            for(const t of response.transactions) {
                t['item_name'] = (await itemService.getItem(t['item_id']))['name'];
            }
        }
        catch(e) {
            response.error = e;
        }
        res.render('admin/admin-transactions.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.get('/users/import', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        res.render('admin/admin-users-import.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.post('/users/import', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};

        if (req.files != null) {
            let file = req.files.file;
            if(!file.name.match(/\.csv$/i)) {
                response.failMessage = "Please upload a valid CSV file";
            }
            else {
                await adminService.appendCsvUsers(file).then((result) => {
                if(result) response.successMessage = "Success!";
                else response.failMessage = "An error occurred with the CSV file. The error message can be found in the console.";
                }).catch((e) => {
                    response.failMessage = "An error occurred with the CSV file. The error message can be found in the console.";
                });
            }
        }
        else response.failMessage = "Please select a CSV file to upload"; // user never selected a file

        res.render('admin/admin-users-import.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

// Returns a view that lets the user backup or clear tables
router.get('/backup', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        res.render('admin/admin-backup.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

// Downloads a CSV copy of the Items table
router.get('/backup/items.csv', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let data = '';

        let client = new Client({
            database: process.env.DATABASE_URL,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        });

        if(process.env.NODE_ENV === 'prod') {
            client.host = process.env.POSTGRESQL_SERVICE_HOST;
            client.port = process.env.POSTGRESQL_SERVICE_PORT;
        }
        
        client.connect(function(pgErr, client, done) {
            if(pgErr) {
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
    }
});

// Downloads a CSV copy of the Transactions table
router.get('/backup/transactions.csv', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let data = '';

        let client = new Client({
            database: process.env.DATABASE_URL,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        });

        if(process.env.NODE_ENV === 'prod') {
            client.host = process.env.POSTGRESQL_SERVICE_HOST;
            client.port = process.env.POSTGRESQL_SERVICE_PORT;
        }
        
        client.connect(function(pgErr, client, done) {
            if(pgErr) {
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
    }
});

// Downloads a CSV copy of the Users table
router.get('/backup/volunteers.csv', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let data = '';

        let client = new Client({
            database: process.env.DATABASE_URL,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        });

        if(process.env.NODE_ENV === 'prod') {
            client.host = process.env.POSTGRESQL_SERVICE_HOST;
            client.port = process.env.POSTGRESQL_SERVICE_PORT;
        }
        
        client.connect(function(pgErr, client, done) {
            if(pgErr) {
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
    }
});

router.post('/delete/items', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {'table': 'items'};
        await itemService.deleteAllItems();
        response.success = true;
        res.render('admin/admin-delete-confirm.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.post('/delete/transactions', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {'table': 'transactions'};
        await tranService.deleteAllTransactions();
        response.success = true;
        res.render('admin/admin-delete-confirm.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.post('/delete/users', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {'table': 'users'};
        await adminService.deleteAllUsers();
        response.success = true;
        res.render('admin/admin-delete-confirm.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.get('/database', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        res.render('admin/admin-database.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.post('/database', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        try {
            await dbUtil.dropTables(false);
            await dbUtil.createTables(false);
            await dbUtil.initAdmin(false);
            response.success = 1;
        } catch (e) {
            console.error(e);
            response.success = 0; 
        }
        res.render('admin/admin-database.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

module.exports = router;