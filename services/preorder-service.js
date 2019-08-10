const   Preorder = require("../db/sequelize").preorders,
        Transaction = require("../db/sequelize").transactions,
        Item = require("../db/sequelize").items,
        itemService = require("./item-service"),
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");

exports.createPreorder = async function (itemId, quantity, onyen) {
    let item = await Item.findOne({ where: { id: itemId } });
    quantity = -quantity;

    if(quantity < 0 && item.count < Math.abs(quantity)) {
        throw new BadRequestException("The amount requested is larger than the quantity in the system");
    }

    try {
        let transaction = await Transaction.build({
            item_id: itemId,
            count: quantity,
            onyen: onyen,
            volunteer_id: "PREORDER",
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

exports.getPreorder = async function (id) {
    try {
        let preorder = await Transaction.findOne({ where: { id: id } });
        if (!preorder) {
            throw new BadRequestException("The transaction could not be retrieved.");
        }
        return preorder;
    } catch (e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }
        throw e;
        // throw new InternalErrorException("A problem occurred when retrieving the item",e);
    }
}

exports.getAllPreorders = async function () {
    try {
        let preorders = await Transaction.findAll({
            where: {
                volunteer_id: "PREORDER",
                status: "pending"
            }
        });
        return preorders;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving items",e);
    }
}

exports.completePreorder = async function(preorderId, volunteerId) {
    try {
        let preorder = await this.getPreorder(preorderId);
        preorder.volunteer_id = volunteerId;
        preorder.status = "complete";
        preorder.save();
    } catch (e) {
        throw e;
        // throw new InternalErrorException("A problem occurred when retrieving items",e);
    }
}

exports.cancelPreorder = async function(preorderId, volunteerId, count) {
    try {
        console.log(preorderId);
        let preorder = await this.getPreorder(preorderId);
        preorder.volunteer_id = volunteerId;
        preorder.status = "cancelled";
        preorder.save();
        let itemId = preorder.item_id;
        await this.putbackCancelledItems(itemId, count);
    } catch (e) {
        throw e;
        // throw new InternalErrorException("A problem occurred when retrieving items",e);
    }
}

exports.putbackCancelledItems = async function(itemId, count) {
    try {
        let item = await Item.findOne({ where: { id: itemId } });
        item.increment('count', {by: count});
    } catch (e) {
        throw e;
    }
}