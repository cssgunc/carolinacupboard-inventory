const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('transactions', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            require: true,
            primaryKey: true
        },
		
        item_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            require: true
        },
		
		count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            require: true,
            unique: false
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
            require: true
        },
		status: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            validate: {
                isIn: [['pending', 'complete', 'cancelled']]
            }
        }
    });
}