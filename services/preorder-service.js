const { v4: uuidv4 } = require("uuid"),
    Order = require("../db/sequelize").orders,
    Transaction = require("../db/sequelize").transactions,
    Item = require("../db/sequelize").items,
    BadRequestException = require("../exceptions/bad-request-exception"),
    InternalErrorException = require("../exceptions/internal-error-exception"),
    CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");


/**
 * Retrieves and returns a preorder by id
 * @param {number} id 
 */
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

/**
 * Retrieves and returns all preorders
 */
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

/**
 * Creates a new preorder
 * Takes a cart, an array of objects that contain item id and quantity
 * Creates a new Order object and creates a new transaction under that order for each cart item
 * If any single transaction fails, the order is rolled back
 * Returns true if successful, false if not
 * @param {array} cart 
 * @param {string} onyen 
 */
exports.createPreorder = async function (cart, onyen) {
    let processQueue = {};
    let completedTransactions = [];

    const newOrderId = uuidv4();
    await Order.create({ id: newOrderId });

    // Adds item to process queue, combines duplicate items
    cart.forEach((item) => {
        processQueue[item.id] = processQueue[item.id] === undefined ? item.quantity : currQuantity + item.quantity;
    });

    try {
        // Creates transactions for each item in the process queue
        for(id in processQueue) {
            quantity = processQueue[id];
            console.log(id, quantity)

            // Skips if quantity is zero or less
            if (quantity <= 0) return;

            let item = await Item.findOne({ where: { id: id } });

            if (!item) {
                throw new BadRequestException("The item " + item.name + " doesn't exist in our inventory");
            }

            // console.log(item);

            // Throws an error if there aren't enough in stock
            if (quantity > 0 && item.count < quantity) {
                console.log("BAD");
                throw new BadRequestException("The amount requested for " + item.name + " is " + (quantity - item.count) + " more than the quantity in the system");
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

            console.log(transaction);

            await transaction.save();

            // changes item count, but if it fails, roll back this transaction
            try {
                await item.increment('count', { by: -quantity });
            } catch (e) {
                await this.deletePreorder(transaction.id, 'PREORDER');
                throw e;
            }

            delete processQueue[id];
            completedTransactions.push(transaction);
        }

        return true;
    } catch (e) {
        // If one transaction fails, we delete each of them and revert the counts
        completedTransactions.forEach(async (transaction) => {
            this.deletePreorder(transaction.id);
            let item = await Item.findOne({ where: { id: transaction.item_id } });
            await item.increment('count', { by: -(transaction.count) });
        });

        await Order.destroy({ where: { id: newOrderId } });
    }
    return false;
}

/**
 * Marks a preorder as confirmed/completed
 * @param {number} preorderId 
 * @param {onyen} volunteerId 
 */
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

/**
 * Marks a preorder as cancelled
 * @param {number} preorderId 
 * @param {onyen} volunteerId 
 */
exports.cancelPreorder = async function (preorderId, volunteerId) {
    try {
        let preorder = await this.getPreorder(preorderId);
        preorder.volunteer_id = volunteerId;
        preorder.status = "cancelled";
        preorder.save();
        let itemId = preorder.item_id;
        await this.putbackCancelledItems(itemId, -preorder.count);
    } catch (e) {
        throw new InternalErrorException("A problem occurred when cancelling preorder", e);
    }
}

/**
 * Deletes a preorder by id
 * @param {number} preorderId 
 */
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

/**
 * Re-adds quantity of an item that was reserved by a preorder
 * @param {number} itemId 
 * @param {number} count 
 */
exports.putbackCancelledItems = async function (itemId, count) {
    try {
        let item = await Item.findOne({ where: { id: itemId } });
        item.increment('count', { by: count });
    } catch (e) {
        throw e;
    }
}