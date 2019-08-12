const adminService = require("../services/admin-service");

adminService.createUser("PREORDER", "admin");
if(process.env.DEFAULT_ADMIN) {
    adminService.createUser(process.env.DEFAULT_ADMIN, "admin");
}