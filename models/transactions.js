const   { v4: uuidv4 } = require("uuid"),
        Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    let Transaction = sequelize.define('transactions', {
        id: {
            type: Sequelize.UUID,
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

    Transaction.beforeCreate((transaction) => {
        return transaction.id = uuidv4();
    });

    return Transaction;
}