let Sequelize       = require("sequelize"),
    Items           = require("../models/items"),
    Preorders       = require("../models/preorders"),
    Transactions    = require("../models/transactions"),
    Users           = require("../models/users");

if (!process.env.DATABASE_URL) {
    require("dotenv").config()
}

let options = {
    dialect: 'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false,
    logging: false
}
if(process.env.DATABASE_HOST) {
    options.host = process.env.DATABASE_HOST;
}

let sequelize = new Sequelize(process.env.DATABASE_URL, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, options);

//define models
sequelize.items = Items.init_table(sequelize);
sequelize.preorders = Preorders.init_table(sequelize);
sequelize.transactions = Transactions.init_table(sequelize);
sequelize.users = Users.init_table(sequelize);

//define relationships
sequelize.transactions.belongsTo(sequelize.users, {foreignKey: 'volunteer_id'});
sequelize.transactions.belongsTo(sequelize.items, {foreignKey: 'item_id'});

async function createTables() {
    try {
        await sequelize.sync();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

createTables();

module.exports = sequelize;