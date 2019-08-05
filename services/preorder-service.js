const   Preorder = require("../db/sequelize").preorders,
        Transaction = require("../db/sequelize").transactions,
        Item = require("../db/sequelize").items,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");

exports.createPreorder = async function (itemId, quantity, onyen) {
    let item = await this.getItem(itemId);

    if(quantity < 0 && item.count < Math.abs(quantity)) {
        throw new BadRequestException("The amount requested is larger than the quantity in the system");
    }

    try {
        let transaction = await Transaction.build({
            item_id: itemId,
            count: quantity,
            onyen: onyen,
            volunteer_id: volunteerId,
            status: 'pending'
        });
        // await item.save();
        await transaction.save();
        item.increment('count', {by: quantity});
    } catch (e) {
        throw e;
        // throw new InternalErrorException("A problem occurred when adding the transaction",e);
    }
}

exports.getAllPreorders = async function () {
    try {
        let preorders = await Transaction.findAll({
            where: {
                volunteer_id: "PREORDER"
            }
        });
        return preorders;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving items",e);
    }
}