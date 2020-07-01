const authService = require("../../services/authorization-service"),
    adminService = require("../../services/admin-service"),
    exceptionHandler = require("../../exceptions/exception-handler");

// Checks if the user is authenticated or not
// We are trusting that the Shibboleth reverse proxy from CloudApps is the only access point for our app
exports.userIsAuthenticated = async (req, res, next) => {
    let onyen = await authService.getOnyen(req);
    if (onyen) {
        res.locals.onyen = onyen;
        next();
    } else {
        return res.sendStatus(403);
    }
}

// Checks if the user has filled out their PID and email
exports.userHasInfo = async (req, res, next) => {
    let user = await adminService.getUser(res.locals.onyen);

    // Allows requests to the /account routes because they are needed to update account info
    if (req.originalUrl === '/account/update') {
        // Existing users have a type, new users must be assigned one
        res.locals.userType = user ? user.get('type') : 'user';
        next();
    } 
    // New users are redirected to update info and users who are missing information are redirected to update info
    else if (!user || !user.get('pid') || !user.get('email')) {
        res.redirect('/account/update');
    } 
    // All other users are forwarded to the next page
    else {
        res.locals.userType = user.get('type');
        next();
    }
}

// Checks if a user type is in an array of provided types
const typeInGroup = (type, group) => {
    return group.includes(type);
}

// Checks if user is an admin, volunteer, or user
// Blocks access from banned visitors
exports.userIsBasicUser = async (req, res, next) => {
    if (res.locals.userType && typeInGroup(res.locals.userType, ['admin', 'volunteer', 'user'])) {
        next();
    } else {
        return res.sendStatus(403);
    }
}

// Checks if user is an admin or volunteer
// Blocks access from basic users and banned visitors
exports.userIsVolunteer = async (req, res, next) => {
    if (res.locals.userType && typeInGroup(res.locals.userType, ['admin', 'volunteer'])) {
        next();
    } else {
        return res.sendStatus(403);
    }
}

// Checks if user is an admin
// Blocks access from volunteers, basic users, and banned visitors
exports.userIsAdmin = async (req, res, next) => {
    if (res.locals.userType && typeInGroup(res.locals.userType, ['admin'])) {
        next();
    } else {
        return res.sendStatus(403);
    }
}
