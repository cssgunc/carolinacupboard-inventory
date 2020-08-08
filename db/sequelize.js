let Sequelize       = require("sequelize"),
    Items           = require("../models/items"),
    Orders          = require("../models/orders"),
    Transactions    = require("../models/transactions"),
    Users           = require("../models/users");

if (!process.env.DATABASE_NAME) {
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
if (process.env.POSTGRESQL_SERVICE_HOST) {
    console.log("POSTGRESQL_SERVICE_HOST: " + process.env.POSTGRESQL_SERVICE_HOST);
    options.host = process.env.POSTGRESQL_SERVICE_HOST;
} else if (process.env.DATABASE_HOST) {
    options.host = process.env.DATABASE_HOST;
}

if (process.env.POSTGRESQL_SERVICE_PORT) {
    console.log("POSTGRESQL_SERVICE_PORT: " + process.env.POSTGRESQL_SERVICE_PORT);
    options.port = process.env.POSTGRESQL_SERVICE_PORT;
} else if (process.env.DATABASE_PORT) {
    options.port = process.env.DATABASE_PORT;
}

let sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, options);

;(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

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
