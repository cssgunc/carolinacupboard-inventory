const   Item = require("../db/sequelize").items,
        Transaction = require("../db/sequelize").transactions,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception");

exports.createItem = async function (name, barcode, description, count) {
    try {
        let item = await Item.build({
            name: name,
            barcode: barcode,
            description: description,
            count: count
        });
        await item.save();
    } catch (e) {
        if (e instanceof Sequelize.ValidationError) {
            let errorMessage = "The following values are invalid:";
            e.errors.forEach((error) => {
                errorMessage += `\n${error.path}: ${error.message}`;
            });
            throw new BadRequestException(errorMessage);
        }
        throw new InternalErrorException("A problem occurred when saving the item",e);
    }
}

exports.getItems = async function () {
    try {
        let items = await Item.findAll();
        return items;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving items",e);
    }
}

exports.getItem = async function (itemId) {
    try {
        let item = await Item.findOne({ where: { id: itemId } });
        if (!item) {
            throw new BadRequestException("The item could not be retrieved.");
        }
        return item;
    } catch (e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }

        throw new InternalErrorException("A problem occurred when retrieving the item",e);
    }
}

exports.addItems = async function (itemId, quantity, onyen, volunteerId) {
    await this.createTransaction(itemId, quantity, onyen, volunteerId);
}

exports.removeItems = async function (itemId, quantity, onyen, volunteerId) {
    await this.createTransaction(itemId, -quantity, onyen, volunteerId);
}

exports.createTransaction = async function (itemId, quantity, onyen, volunteerId) {
    let item = await this.getItem(itemId);
    item.count += quantity;

    if(item.count < 0) {
        throw new BadRequestException("The amount requested is larger than the quantity in the system");
    }

    try {
        let transaction = await Transaction.build({
            item_id: itemId,
            count: -quantity,
            onyen: onyen,
            volunteer_id: volunteerId,
            status: 'complete'
        });
        await item.save();
        await transaction.save();
    } catch (e) {
        throw new InternalErrorException("A problem occurred when adding the transaction",e);
    }
}