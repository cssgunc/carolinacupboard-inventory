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

/*
Looks for an item, first by barcode, then by name and decription
Returns the item found or null if nothing is found
*/
exports.getItemByBarcodeThenNameDesc = async function (barcode, name, desc) {
    try {
        let item = await getItemByBarcode(barcode);
        if(!item) item = await getItemByNameDesc(name, desc);
        return item;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving the item by barcode, or name and description",e);
    }
}

/*
Looks for an item by barcode
Returns the item found or null if nothing is found
*/
let getItemByBarcode = async function (barcode) {
    if (!barcode || barcode === "") return null;
    try {
        let item = await Item.findOne({ where: { barcode: barcode }});
        return item;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving the item by barcode",e);
    }
}

/*
Looks for an item by name and description
Returns the item fround or null if nothing is found
*/
let getItemByNameDesc = async function (name, desc) {
    try {
        let item = await Item.findOne({ where: { name: name, description: desc }});
        return item;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving the item by name and description",e);
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

// Appends a given CSV to the item table
// On duplicate, adds the existing count and the new count together
exports.appendCsv = async function (data) {
    // wrapping everything in a Promise, so we can return exceptions from the csvParser callback
    // this will allow the caller to tell when the Item table creation fails
    return new Promise((resolve, reject) => {
        try {
            csvParser(data.data, 
                {
                    delimiter: ',', 
                    endLine: '\n', 
                    escapeChar: '"', 
                    enclosedChar: '"'
                }, 
                function(err, output) {
                    if (err) {
                        throw new InternalErrorException("A problem occurred when parsing CSV data");
                    }

                    for(let i = 0; i < output.length; i++) {
                        let entry = output[i];

                        // Skip row headers
                        if (entry.length === 7 && i === 0) continue;

                        let item = "";

                        // Generate date for createdAt and updatedAt fields and strip timezone for Postgres
                        let date = new Date();
                        date = date.toLocaleDateString() + " " + date.toLocaleTimeString();

                        // Expects a file with only the necessary data
                        if (entry.length === 4) {
                            // Empty barcode maps to NULL for our Postgres model, pre-wrap with single quotes
                            let barcode = entry[1] === "" ? "NULL" : "'" + entry[1] + "'";
                            // Prep values for query by enclosing in paren, wrapping in single quotes (except barcode), and joining by comma
                            // Postgres uses double single quotes to escape single quotes in strings, so we do a replace
                            item = "(" + [entry[0], barcode, entry[2], entry[3], date, date].map((s,i) => { return i === 1 ? s : "'"+s.replace(/'/g, "''")+"'" }).join(",") + ")";
                        }
                        // Expects a file with the same format as an exported file
                        else if (entry.length === 7) {
                            // Empty barcode maps to NULL for our Postgres model, pre-wrap with single quotes
                            let barcode = entry[2] === "" ? "NULL" : "'" + entry[2] + "'";
                            // Prep values for query by enclosing in paren, wrapping in single quotes (except barcode), and joining by comma
                            // Postgres uses double single quotes to escape single quotes in strings, so we do a replace
                            item = "(" + [entry[1], barcode, entry[3], entry[4], date, date].map((s,i) => { return i === 1 ? s : "'"+s.replace(/'/g, "''")+"'" }).join(",") + ")";
                        }
                        else {
                            console.error("File not in the expected format, see line " + (i+1));
                            reject(e);
                        }

                        // Execute query, on conflict with name/desc composite primary key, add existing and new counts
                        sequelize.query(`INSERT INTO items (name, barcode, count, description, "createdAt", "updatedAt") 
                        VALUES ${item}
                        ON CONFLICT (name, description)
                        DO UPDATE
                        SET count = items.count + EXCLUDED.count`
                        ).then(function(result) {
                            resolve(result);
                        }).catch(function(e) {
                            console.error(e);
                            reject(e);
                        });
                    }

                    
                }
            );
        } catch(e) {
            console.error(e);
            reject(e);
        }
    });
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