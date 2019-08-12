let express = require("express"),
    router = express.Router(),
    adminService = require("../services/admin-service"),
    authService = require("../services/authorization-service"),
    tranService = require("../services/transaction-service"),
    itemService = require("../services/item-service"),
    exceptionHandler = require("../exceptions/exception-handler");

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
        res.render('admin/admin-transactions.ejs', {response: response, onyen: onyen, userType: userType    });
    }
});

module.exports = router;