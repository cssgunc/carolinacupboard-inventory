const   Transaction = require("../db/sequelize").transactions,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");

/**
 * Retrieves and returns all transactions
 */
exports.getAllTransactions = async function () {
    try {
        let trans = await Transaction.findAll();
        return trans;
    } catch (e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }
        throw new InternalErrorException("A problem occurred when retrieving the transaction", e);
    }
};

/**
 * Retrieves and returns all removal transactions by a specific visitor onyen
 * @param {string} onyen 
 */
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
};

/**
 * Deletes all transactions
 */
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
};