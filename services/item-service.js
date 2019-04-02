const   Item = require("../db/sequelize").item,
        Sequelize = require("sequelize"),
        BadRequestException = require("../exceptions/bad-request-exception"),
        InternalErrorException = require("../exceptions/internal-error-exception");

exports.createItem = async function (name, barcode, description) {
    try {
        let item = await Item.build({
            name: name,
            barcode: barcode,
            description: description
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
        let items = await Attribute.findAll();
        return items;
    } catch (e) {
        throw new InternalErrorException("A problem occurred when retrieving items",e);
    }
}