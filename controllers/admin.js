let express = require("express"),
    router = express.Router(),
    adminService = require("../services/admin-service"),
    authService = require("../services/authorization-service"),
    exceptionHandler = require("../exceptions/exception-handler");

router.get('/', async function(req, res, next) {
    let onyen = req.header("uid");
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
        res.render("admin/admin.ejs", {response : response, types : types, onyen: onyen, userType: userType});
    }
});

router.post('/create', async function(req, res, next) {
    let onyen = req.header("uid");
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

        res.redirect('/admin');
    }
});


router.post('/edit', async function(req, res, next) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    // if(!onyen) res.sendStatus(403);
    if(userType !== "admin") res.sendStatus(403);
    else {
        try {
            let editOnyen = req.body.onyen;
            let type = req.body.type;

            let currtype = await authService.getUserType(editOnyen);
            if(currtype === "admin") {
                let adminCount = await adminService.countAllAdmins();
                if(adminCount <= 1) {
                    res.status(500).send('Cannot remove the last admin');
                    return;
                }
            }
            await adminService.changeUserType(editOnyen, type);

        } catch(e) {
            res.status(500).send("Internal server error");
            return;
        }

        res.redirect('/admin');
    }
});

router.post('/delete', async function(req, res, next) {
    let onyen = req.header("uid");
    let userType = await authService.getUserType(onyen);
    // if(!onyen) res.sendStatus(403);
    if(userType !== "admin") res.sendStatus(403);
    else {
        try {
            let delOnyen = req.body.onyen;

            
            if(await authService.getUserType(delOnyen) === "admin") {
                let adminCount = await adminService.countAllAdmins();
                console.log("Admin count: " + adminCount);
                if(adminCount <= 1) {
                    res.status(500).send('Cannot delete the last admin');
                    return;
                }
            }
            await adminService.deleteUser(delOnyen);

        } catch(e) {
            res.status(500).send("Internal server error");
            return;
        }

        res.redirect('/admin');
    }
});

module.exports = router;