const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('preorder', {
        
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
		
		transaction_id: {
            type: Sequelize.INTEGER,
            require: true,
        }
    });
}