const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('items', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            require: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            unique: true,
            validate: {
                isAlphanumeric: true
            }
        },
		barcode: {
            type: Sequelize.INTEGER,
            allowNull: true,
            require: false,
            unique: true,
            validate: {
                isAlphanumeric: true,
				len: [12]
            }
        },
		count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            require: true,
            unique: false,
            validate: {
                isAlphanumeric: true
            }
        },
		description: {
            type: Sequelize.STRING,
            allowNull: true,
            require: false,
            unique: false,
            validate: {
                isAlphanumeric: true
            }
        }
    });
}