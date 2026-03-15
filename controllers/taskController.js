const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Create a new task
// @route   POST /tasks
// @access  Private
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all tasks (optionally filtered by project)
// @route   GET /tasks
// @access  Private
exports.getTasks = async (req, res) => {
    try {
        let whereClause = {};

        if (req.query.projectId) {
            whereClause.projectId = req.query.projectId;
        }

        const tasks = await Task.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
                { model: Project, as: 'project', attributes: ['id', 'projectName'] }
            ]
        });

        const mappedTasks = tasks.map(t => ({
            ...t.toJSON(),
            _id: t.id,
            assignedTo: { ...t.assignee?.toJSON(), _id: t.assignee?.id },
            projectId: { ...t.project?.toJSON(), _id: t.project?.id }
        }));

        res.status(200).json({ success: true, count: mappedTasks.length, data: mappedTasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single task
// @route   GET /tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id, {
            include: [
                { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
                { model: Project, as: 'project', attributes: ['id', 'projectName'] }
            ]
        });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        const data = {
            ...task.toJSON(),
            _id: task.id,
            assignedTo: { ...task.assignee?.toJSON(), _id: task.assignee?.id },
            projectId: { ...task.project?.toJSON(), _id: task.project?.id }
        };
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update task
// @route   PUT /tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
    try {
        let task = await Task.findByPk(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        task = await task.update(req.body);

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete task
// @route   DELETE /tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.destroy();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
