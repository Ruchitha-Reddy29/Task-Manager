const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './taskmanager.sqlite',
  logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
