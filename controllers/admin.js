let express = require("express"),
    router = express.Router(),
    adminService = require("../services/admin-service"),
    authService = require("../services/authorization-service"),
    tranService = require("../services/transaction-service"),
    itemService = require("../services/item-service"),
    exceptionHandler = require("../exceptions/exception-handler"),
    copyTo = require('pg-copy-streams').to,
    {Client} = require('pg'),
    fs = require('fs');

router.get('/', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        res.render("admin/admin.ejs", {onyen: onyen, userType: userType});
    }
});

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


router.post('/users/edit', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    // if(!onyen) res.sendStatus(403);
    if(userType !== "admin") res.sendStatus(403);
    else {
        try {
            let editOnyen = req.body.onyen;
            if (editOnyen === "PREORDER") {
                res.status(403).send("Cannot edit PREORDER admin");
                return;
            }
            let type = req.body.type;

            let currType = await authService.getUserType(editOnyen);
            if(currType === "admin") {
                let adminCount = await adminService.countAllAdmins();
                if(adminCount <= 2) {
                    res.status(500).send('Cannot remove the last admin');
                    return;
                }
            }
            await adminService.changeUserType(editOnyen, type);

        } catch(e) {
            res.status(500).send("Internal server error");
            return;
        }

        res.redirect('/admin/users');
    }
});

router.post('/users/delete', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    // if(!onyen) res.sendStatus(403);
    if(userType !== "admin") res.sendStatus(403);
    else {
        try {
            let delOnyen = req.body.onyen;
            if (delOnyen === "PREORDER") {
                res.status(403).send("Cannot delete PREORDER admin");
                return;
            }
            
            if(await authService.getUserType(delOnyen) === "admin") {
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

router.get('/history', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        try {
            response.transactions = await tranService.getAllTransactions();
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

router.get('/import', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        res.render('admin/admin-import.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.post('/import', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        let file = req.files.file;
        await itemService.appendCsv(file);
        res.render('admin/admin-import.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.get('/backup', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        res.render('admin/admin-backup.ejs', {response: response, onyen: onyen, userType: userType});
    }
});

router.get('/backup/items', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        let data = '';

        let client = new Client({
            database: process.env.DATABASE_URL,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        });
        
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

router.get('/backup/transactions', async function(req, res, next) {
    let onyen = await authService.getOnyen(req);
    let userType = await authService.getUserType(onyen);
    if(userType !== "admin") res.sendStatus(403);
    else {
        let response = {};
        let data = '';

        let client = new Client({
            database: process.env.DATABASE_URL,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        });
        
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

module.exports = router;