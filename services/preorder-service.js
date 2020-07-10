const { v4: uuidv4 } = require("uuid"),
    Order = require("../db/sequelize").orders,
    Transaction = require("../db/sequelize").transactions,
    Item = require("../db/sequelize").items,
    BadRequestException = require("../exceptions/bad-request-exception"),
    InternalErrorException = require("../exceptions/internal-error-exception"),
    CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");

exports.createPreorder = async function (onyen, cart) {
    let processQueue = {};
    let completedTransactions = [];

    const newOrderId = uuidv4();
    await Order.create({ id: newOrderId });

    // console.log(cart[0]);

    // Adds item to process queue, combines duplicate items
    cart.forEach((item) => {
        console.log(item);
        processQueue[item.id] = processQueue[item.id] === undefined ? item.quantity : currQuantity + item.quantity;
    });

    try {
        // Creates transactions for each item in the process queue
        for(id in processQueue) {
            quantity = processQueue[id];
            console.log(id, quantity)

            if (quantity === 0) return;

            let item = await Item.findOne({ where: { id: id } });

            if (quantity > 0 && item.count < Math.abs(quantity)) {
                throw new BadRequestException("The amount requested is larger than the quantity in the system");
            }

            let transaction = await Transaction.build({
                item_id: id,
                item_name: item.name,
                count: -quantity,
                onyen: onyen,
                order_id: newOrderId,
                volunteer_id: "PREORDER",
                status: 'pending'
            });

            await transaction.save();

            try {
                await item.increment('count', { by: -quantity });
            } catch (e) {
                await this.deletePreorder(transaction.id, 'PREORDER');
                throw e;
            }

            delete processQueue[id];
            completedTransactions.push(transaction);
        }
    } catch (e) {
        // If one transaction fails, we delete each of them and revert the counts
        completedTransactions.forEach(async (transaction) => {
            this.deletePreorder(transaction.id);
            let item = await Item.findOne({ where: { id: transaction.item_id } });
            await item.increment('count', { by: -(transaction.count) });
        });

        await Order.destroy({ where: { id: newOrderId } });
    }
}

exports.getPreorder = async function (id) {
    try {
        let preorder = await Transaction.findOne({ where: { id: id } });
        if (!preorder || preorder.volunteer_id !== 'PREORDER') {
            throw new BadRequestException("The transaction could not be retrieved.");
        }
        return preorder;
    } catch (e) {
        if (e instanceof CarolinaCupboardException) {
            throw e;
        }
        throw new InternalErrorException("A problem occurred when retrieving a preorder", e);
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
        throw new InternalErrorException("A problem occurred when retrieving all preorders", e);
    }
}

exports.completePreorder = async function (preorderId, volunteerId) {
    try {
        let preorder = await this.getPreorder(preorderId);
        preorder.volunteer_id = volunteerId;
        preorder.status = "complete";
        preorder.save();
    } catch (e) {
        throw new InternalErrorException("A problem occurred when completing preorder", e);
    }
}

exports.cancelPreorder = async function (preorderId, volunteerId) {
    try {
        let preorder = await this.getPreorder(preorderId);
        preorder.volunteer_id = volunteerId;
        preorder.status = "cancelled";
        preorder.save();
        let itemId = preorder.item_id;
        await this.putbackCancelledItems(itemId, preorder.count);
    } catch (e) {
        throw new InternalErrorException("A problem occurred when cancelling preorder", e);
    }
}

exports.deletePreorder = async function (preorderId) {
    try {
        await Transaction.destroy({
            where: {
                id: preorderId
            }
        });
    } catch (e) {
        throw new InternalErrorException("A problem occurred when deleting preorder", e);
    }
}

exports.putbackCancelledItems = async function (itemId, count) {
    try {
        let item = await Item.findOne({ where: { id: itemId } });
        item.increment('count', { by: count });
    } catch (e) {
        throw e;
    }
}