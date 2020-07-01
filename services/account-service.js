const User = require("../db/sequelize").users,
    Sequelize = require("sequelize"),
    BadRequestException = require("../exceptions/bad-request-exception"),
    InternalErrorException = require("../exceptions/internal-error-exception"),
    CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception"),
    initAdmin = require("../db/db-util").initAdmin,
    csvParser = require("csv-parse");

exports.updateInfo = async function (onyen, type, pid, email) {
    try {
        let newInfo = {
            onyen: onyen,
        };
        newInfo.type = type ? type : 'user';
        if (pid) newInfo.pid = pid;
        if (email) newInfo.email = email;

        let user = await User.upsert(newInfo, {
            returning: true
        });
        return user;
    } catch (e) {
        throw new InternalErrorException("Failed to update account info", e);
    }
}