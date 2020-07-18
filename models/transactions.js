const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('transactions', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        order_id: {
            type: Sequelize.UUID,
            allowNull: false
        },
		
        item_id: {
            type: Sequelize.UUID,
            allowNull: false,
        },

        item_name: {
            type: Sequelize.STRING,
            allowNull: true,
        },
		
		count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: false
        },
		
		onyen: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: false,
            validate: {
                isAlphanumeric: true
            }
        },

		volunteer_id: {
            type: Sequelize.STRING,
            allowNull: false,
        },

		status: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isIn: [['pending', 'complete', 'cancelled']]
            }
        }
    });
}