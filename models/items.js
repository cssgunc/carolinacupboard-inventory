const   { v4: uuidv4 } = require("uuid"),
        Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    let Item = sequelize.define('items', {
        id: {
            type: Sequelize.UUID,
            allowNull: false,
            unique: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: "nameDescConstraint",
            primaryKey: true,
        },
		barcode: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        },
		count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: false,
            validate: {
                isAlphanumeric: true,
                min: 0
            }
        },
		description: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: "nameDescConstraint",
            primaryKey: true,
        }
    });

    Item.beforeCreate((item) => {
        return item.id = uuidv4();
    });

    return Item;
}