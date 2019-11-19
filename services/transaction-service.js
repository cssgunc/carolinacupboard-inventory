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

exports.getUserPurchaseHistory = async function(onyen) {
    try {
        let trans = await Transaction.findAll({
            where: {
                onyen: onyen,
                count: {[Sequelize.Op.lt]: 0}
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

exports.deleteAllTransactions = async function() {
    try {
        await Transaction.destroy({
            where: {},
            truncate: true
        });
    } catch(e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }
        
        throw new InternalErrorException("A problem occurred when deleting the transactions", e);
    }
}