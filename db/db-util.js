const sequelize         = require("./sequelize");
const adminService      = require("../services/admin-service");

async function dropTables() {
    try {
        await sequelize.drop();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

async function createTables() {
    try {
        await sequelize.sync();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

const initAdmin = async() => {
    await adminService.createUser("PREORDER", "admin");
    if(process.env.DEFAULT_ADMIN) {
        await adminService.createUser(process.env.DEFAULT_ADMIN, "admin");
    }
    process.exit(0);
}

exports.dropTables = dropTables;
exports.createTables = createTables;
exports.initAdmin = initAdmin;