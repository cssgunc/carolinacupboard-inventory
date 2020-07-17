const sequelize         = require("./sequelize");
const userService      = require("../services/user-service");
const testUtil          = require("../tests/util/test-util");

// exit param is passed to determine whether or not to exit after running the function
// for scripts, exit should be true
// when called by the server, exit should be false

/**
 * Drops all tables in sequelize
 * @param {boolean} exit - If true, exit the process after finishing
 */
async function dropTables(exit) {
    try {
        await sequelize.drop();
        if (exit) process.exit(0);
    } catch (e) {
        console.error(e);
        if (exit) process.exit(1);
    }
}

/**
 * Creates all tables defined in sequelize
 * @param {boolean} exit - If true, exit the process after finishing
 */
async function createTables(exit) {
    try {
        await sequelize.sync();
        if (exit) process.exit(0);
    } catch (e) {
        console.error(e);
        if (exit) process.exit(1);
    }
}

/**
 * Creates the PREORDER and default admin users in the Users table
 * @param {boolean} exit - If true, exit the process after finishing
 */
async function initAdmin(exit) {
    await userService.createUser("PREORDER", "admin", 0, "preorder@admin.com");
    if(process.env.DEFAULT_ADMIN) {
        await userService.createUser(process.env.DEFAULT_ADMIN, "admin", 1, "admin@admin.com");
    }
    if (exit) process.exit(0);
}

/**
 * Creates test users in the Users table
 * @param {boolean} exit - If true, exit the process after finishing
 */
async function initTestUsers(exit) {
    await userService.createUser(testUtil.volunteerAuthHeaders.uid, "volunteer", 2, "volunteer@admin.com");
    await userService.createUser(testUtil.userAuthHeaders.uid, "user", 3, "user@admin.com");
    if (exit) process.exit(0);
}

/**
 * Cleans the database for testing
 */
exports.preTestSetup = async () => {
    await dropTables(false);
    await createTables(false);
    await initAdmin(false);
    await initTestUsers(false);
}

exports.dropTables = dropTables;
exports.createTables = createTables;
exports.initAdmin = initAdmin;
exports.initTestUsers = initTestUsers;