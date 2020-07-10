let Sequelize       = require("sequelize"),
    Items           = require("../models/items"),
    Orders          = require("../models/orders"),
    Transactions    = require("../models/transactions"),
    Users           = require("../models/users");

if (!process.env.DATABASE_URL) {
    require("dotenv").config()
}

let options = {
    dialect: 'postgres',
    pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false,
    logging: false
}
if(process.env.POSTGRESQL_SERVICE_HOST) {
    console.log("POSTGRESQL_SERVICE_HOST: " + process.env.POSTGRESQL_SERVICE_HOST);
    options.host = process.env.POSTGRESQL_SERVICE_HOST;
}
if(process.env.POSTGRESQL_SERVICE_PORT) {
    console.log("POSTGRESQL_SERVICE_PORT: " + process.env.POSTGRESQL_SERVICE_PORT);
    options.post = process.env.POSTGRESQL_SERVICE_PORT;
}

let sequelize = new Sequelize(process.env.DATABASE_URL, options);

//define models
sequelize.items = Items.init_table(sequelize);
sequelize.orders = Orders.init_table(sequelize);
sequelize.transactions = Transactions.init_table(sequelize);
sequelize.users = Users.init_table(sequelize);

//define relationships
sequelize.transactions.belongsTo(sequelize.users, {foreignKey: 'volunteer_id'});
sequelize.transactions.belongsTo(sequelize.items, {foreignKey: 'item_id'});
sequelize.transactions.belongsTo(sequelize.orders, {foreignKey: 'order_id'});

module.exports = sequelize;
