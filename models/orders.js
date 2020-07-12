const Sequelize = require("sequelize");

/*
An order is a collection of transactions
*/
exports.init_table = function (sequelize) {
    return sequelize.define('orders', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
    });
}