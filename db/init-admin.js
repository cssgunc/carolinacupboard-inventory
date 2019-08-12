const adminService = require("../services/admin-service");

if(process.env.DEFAULT_ADMIN) {
    adminService.createUser(process.env.DEFAULT_ADMIN, "admin");
}