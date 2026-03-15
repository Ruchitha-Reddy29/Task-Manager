const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Project = require('./Project');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    taskTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a task title' },
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
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Please add a deadline' },
        },
    },
    status: {
        type: DataTypes.ENUM('To Do', 'In Progress', 'Completed'),
        defaultValue: 'To Do',
    },
}, {
    timestamps: true,
});

// Associations
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
User.hasMany(Task, { foreignKey: 'assignedTo' });

Task.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
Project.hasMany(Task, { foreignKey: 'projectId' });

module.exports = Task;
