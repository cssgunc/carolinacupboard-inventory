const sequelize         = require("./sequelize");
const adminService      = require("../services/admin-service");

// exit param is passed to determine whether or not to exit after running the function
// for scripts, exit should be true
// when called by the server, exit should be false

async function dropTables(exit) {
    try {
        await sequelize.drop();
        if (exit) process.exit(0);
    } catch (e) {
        console.error(e);
        if (exit) process.exit(1);
    }
}

async function createTables(exit) {
    try {
        await sequelize.sync();
        if (exit) process.exit(0);
    } catch (e) {
        console.error(e);
        if (exit) process.exit(1);
    }
}

async function initAdmin(exit) {
    await adminService.createUser("PREORDER", "admin");
    if(process.env.DEFAULT_ADMIN) {
        await adminService.createUser(process.env.DEFAULT_ADMIN, "admin");
    }
    if (exit) process.exit(0);
}

exports.dropTables = dropTables;
exports.createTables = createTables;
exports.initAdmin = initAdmin;