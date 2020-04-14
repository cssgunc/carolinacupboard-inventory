const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('visitors', {
        onyen: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            unique: true,
			primaryKey: true,
            validate: {
                isAlphanumeric: true
            }
        },
		PID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            require: true,
            unique: true,
            validate: {
                isNumeric: true,
            }
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        firstTime: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            require: true,
        },
        numItemsReceived: {
            type: Sequelize.INTEGER,
            allowNull: false,
            require: true,
            validate: {
                min: 0,
            }
        },
    });
} 