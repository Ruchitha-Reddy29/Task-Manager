const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create a new project
// @route   POST /projects
// @access  Private
exports.createProject = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const project = await Project.create(req.body);
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all projects
// @route   GET /projects
// @access  Private
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }]
        });
        // Maps standard JSON structure for Frontend expecting `_id` and populated object
        const mappedProjects = projects.map(p => ({
            ...p.toJSON(),
            _id: p.id,
            createdBy: p.creator
        }));
        res.status(200).json({ success: true, count: mappedProjects.length, data: mappedProjects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single project
// @route   GET /projects/:id
// @access  Private
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id, {
            include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }]
        });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        const data = { ...project.toJSON(), _id: project.id, createdBy: project.creator };
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update project
// @route   PUT /projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findByPk(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        project = await project.update(req.body);

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        await project.destroy();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
