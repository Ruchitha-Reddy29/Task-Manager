const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    projectName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a project name' },
            len: [1, 100],
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a description' },
        },
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a start date' },
        },
    },
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a deadline' },
        },
    },
}, {
    timestamps: true,
});

// Associations
Project.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(Project, { foreignKey: 'createdBy' });

module.exports = Project;
