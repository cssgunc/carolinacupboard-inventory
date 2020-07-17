const   User = require("../db/sequelize").users,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");

/**
 * Gets the onyen from the uid request header
 * @param {object} req - request object 
 */
exports.getOnyen = async function(req) {
    // If in dev mode, check for DEV_ONYEN env variable
    if(process.env.NODE_ENV === "dev") {
        if(process.env.DEV_ONYEN) {
            return process.env.DEV_ONYEN;
        }
        return "ONYEN";
    }
    return req.header("uid");
}

/**
 * Gets the user from the user table with the given onyen and return their user type
 * @param {string} onyen - onyen of user to retrieve
 */
exports.getUserType = async function (onyen) {
    try {
        let user = await User.findOne({ where: { onyen: onyen } });
        if (!user) {
            return "user";
        }
        return user.type;
    } catch (e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }
        throw e;
        // throw new InternalErrorException("A problem occurred when retrieving the user",e);
    }
}