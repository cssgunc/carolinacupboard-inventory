const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('transactions', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            require: true,
            primaryKey: true
        },
		
        item: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            validate: {
                isAlphanumeric: true
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
		
		onyen: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            unique: false,
            validate: {
                isAlphanumeric: true
            }
        },
		
		volunteer_id: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            unique: false,
            validate: {
                isAlphanumeric: true
            }
        },
		
		status: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            require: true,
            unique: false,
        },
		
		transaction_date: {
            type: Sequelize.DATE,
            allowNull: false,
            require: true,
            unique: false,
        }
    });
}