const   Item = require("../db/sequelize").items,
        Transaction = require("../db/sequelize").transactions,
        Sequelize = require("sequelize"),
        sequelize = require("../db/sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception"),
        CarolinaCupboardException = require("../exceptions/carolina-cupboard-exception"),
        csvParser = require("csv-parse"),
        copyTo = require('pg-copy-streams').to,
        {Client} = require('pg'),
        fs = require('fs');

exports.createItem = async function (name, barcode, description, count) {
    if(barcode) barcode = barcode.padStart(14, '0');
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

exports.getItems = async function (searchTerm, barcode) {
    if(barcode) barcode = barcode.padStart(14, '0');
    try {
        let whereStatement = {};
        let orStatement = [];

        if(searchTerm) {
            orStatement.push({
                name: {[Sequelize.Op.iLike]: '%'+searchTerm+'%'}
            });
            orStatement.push({
                description: {[Sequelize.Op.iLike]: '%'+searchTerm+'%'}
            });
        }
        if(barcode) {
            orStatement.push({
                barcode: barcode
            });
        }

        if(orStatement.length > 0) {
            whereStatement = {
                [Sequelize.Op.or]: orStatement
            };
        }

        let items = await Item.findAll({
            where: whereStatement
        });
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
    // item.count += quantity;

    if(quantity < 0 && item.count < Math.abs(quantity)) {
        throw new BadRequestException("The amount requested is larger than the quantity in the system");
    }

    try {
        let transaction = await Transaction.build({
            item_id: itemId,
            count: quantity,
            onyen: onyen,
            volunteer_id: volunteerId,
            status: "complete"
        });
        // await item.save();
        await transaction.save();
        item.increment('count', {by: quantity});
    } catch (e) {
        throw e;
        // throw new InternalErrorException("A problem occurred when adding the transaction",e);
    }
}

exports.appendCsv = async function (data) {
    console.log(data);
    try {
        csvParser(data.data, 
            {
                delimiter: ',', 
                endLine: '\n', 
                escapeChar: '"', 
                enclosedChar: '"'
            }, 
            async function(err, output) {
                if (err) {
                    throw new InternalErrorException("A problem occurred when parsing CSV data");
                }
                output.forEach(function(entry) {
                    try {
                        let item = {
                            name: entry[0],
                            barcode: entry[1],
                            count: entry[2],
                            description: entry[3],
                        }
                        
                        if (entry[1] === "") {
                            item.barcode = null;
                        }

                        Item.upsert(item);
                    } catch (e) {
                        throw e;
                    }
                });
            }
        );
    } catch(e) {
        throw e;
    }
}

exports.deleteAllItems = async function() {
    try {
        await Item.destroy({
            where: {},
            truncate: false
        });
    } catch(e) {
        if(e instanceof CarolinaCupboardException) {
            throw e;
        }
        
        throw new InternalErrorException("A problem occurred when deleting the items", e);
    }
}