const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('users', {
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
		type: {
            type: Sequelize.STRING,
            allowNull: false,
            require: true,
            validate: {
                isAlphanumeric: true
            }
        }
    });
}