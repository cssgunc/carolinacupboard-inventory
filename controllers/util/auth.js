const authService = require("../../services/authorization-service"),
    exceptionHandler = require("../../exceptions/exception-handler");

const userIsAuthenticated = async (req, res, next) => {
    let onyen = await authService.getOnyen(req);
    if (onyen) {
        res.locals.onyen = onyen;
        next();

    } else {
        return res.sendStatus(403);
    }
}

const typeInGroup = (type, group) => {
    return group.includes(type);
}

const userIsVolunteer = async (req, res, next) => {
    let userType = await authService.getUserType(res.locals.onyen);
    if (userType && typeInGroup(userType, ['admin', 'volunteer'])) {
        res.locals.userType = userType;
        next();
    } else {
        return res.sendStatus(403);
    }
}

const userIsAdmin = async (req, res, next) => {
    let userType = await authService.getUserType(res.locals.onyen);
    if (userType && typeInGroup(userType, ['admin'])) {
        res.locals.userType = userType;
        next();
    } else {
        return res.sendStatus(403);
    }
}

exports.userIsAuthenticated = userIsAuthenticated;
exports.userIsVolunteer = userIsVolunteer;
exports.userIsAdmin = userIsAdmin;

