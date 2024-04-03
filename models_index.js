// require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('./config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const createDatabaseConnection = async () => {
  try {
      const { host, port, username:user, password, database } = config;
      console.log(`Connecting to MySQL with: { host:${host}, port:${port}, user:${user}, database:${database} }`);
      
      const connection = await mysql.createConnection({ host, port, user, password });
      console.log(`Connected to MySQL`);

      await connection.close();
      
  } catch (error) {
      console.error(`Error creating database connection: ${error.message}`);
  }
}

const checkDatabaseConnection = async () => {

  try {
    await db.sequelize.authenticate();
    console.log(`Connection is established successfully`);

  } catch (error) {
    console.error(`Error establishing connection to database: ${error.message}`);

  }
}

const closeDatabaseConnection = async () => {
  try {
      await db.sequelize.close();
      console.error(`Closed database connection`);
  } catch (error) {
      console.error(`Error closing database connection: ${error.message}`);
  }
};

fs
  .readdirSync('./')
  .filter(file => {
    return (
      file === 'models_user.js' &&
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log(__dirname);
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    console.log("passed");
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.createDatabaseConnection = createDatabaseConnection;
db.checkDatabaseConnection = checkDatabaseConnection;
db.closeDatabaseConnection = closeDatabaseConnection;

module.exports = db;
