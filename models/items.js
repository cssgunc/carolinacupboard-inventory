const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('items', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            require: true,
            unique: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            unique: "nameDescConstraint",
            primaryKey: true,
        },
		barcode: {
            type: Sequelize.STRING,
            allowNull: true,
            require: false,
            unique: true
        },
		count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            require: true,
            unique: false,
            validate: {
                isAlphanumeric: true,
                min: 0
            }
        },
		description: {
            type: Sequelize.STRING,
            allowNull: true,
            require: false,
            unique: "nameDescConstraint",
            primaryKey: true,
        }
    });
}