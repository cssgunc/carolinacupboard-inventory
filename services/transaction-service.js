const   Transaction = require("../db/sequelize").transactions,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");

exports.getAllTransactions = async function () {
    try {
        let trans = await Transaction.findAll();
        return trans;
    } catch (e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }
        // throw e;
        throw new InternalErrorException("A problem occurred when retrieving the transaction", e);
    }
}

exports.getUserHistory = async function(onyen) {
    try {
        let trans = await Transaction.findAll({
            where: {
                onyen: onyen
            }
        });
        return trans;
    } catch(e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }

        throw new InternalErrorException("A problem occurred when retrieving the transaction", e);
    }
}