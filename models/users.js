const Sequelize = require("sequelize");

exports.init_table = function (sequelize) {
    return sequelize.define('users', {
        onyen: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            primaryKey: true,
            validate: {
                isAlphanumeric: true
            }
        },
        type: {
            type: Sequelize.ENUM([
                'admin',
                'volunteer',
                'user',
                'disabled'
            ]),
            allowNull: false,
        },
        pid: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        firstItemDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        numItemsReceived: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            }
        }
    });
}