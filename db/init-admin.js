const adminService = require("../services/admin-service");

const initAdmin = async() => {
    await adminService.createUser("PREORDER", "admin");
    if(process.env.DEFAULT_ADMIN) {
        await adminService.createUser(process.env.DEFAULT_ADMIN, "admin");
    }
    process.exit(0);
}

initAdmin();