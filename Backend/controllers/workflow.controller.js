const Workflow = require("../schemas/workflow_schema");

const createWorkflow = async (req, res, next) => {
    try {
        const { name, description, nodes = [], edges = [] } = req.body;

        if (!name) {
            return res.status(400).json({ message: "name is required" });
        }

        const workflow = await Workflow.create({
            name,
            description,
            nodes: Array.isArray(nodes) ? nodes : [],
            edges: Array.isArray(edges) ? edges : [],
            created_by: req.user?.userId || undefined
        });

        return res.status(201).json({
            message: "Workflow created successfully",
            workflow
        });
    } catch (error) {
        return next(error);
    }
};

const getWorkflows = async (req, res, next) => {
    try {
        const filter = {};

        if (req.user?.userId) {
            filter.created_by = req.user.userId;
        }

        const workflows = await Workflow.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            total: workflows.length,
            workflows
        });
    } catch (error) {
        return next(error);
    }
};

const getWorkflowById = async (req, res, next) => {
    try {
        const { workflowId } = req.params;

        const workflow = await Workflow.findById(workflowId);

        if (!workflow) {
            return res.status(404).json({ message: "Workflow not found" });
        }

        if (req.user?.userId && workflow.created_by && workflow.created_by.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to access this workflow" });
        }

        return res.status(200).json({ workflow });
    } catch (error) {
        return next(error);
    }
};

const updateWorkflow = async (req, res, next) => {
    try {
        const { workflowId } = req.params;
        const { name, description, nodes, edges } = req.body;

        const workflow = await Workflow.findById(workflowId);

        if (!workflow) {
            return res.status(404).json({ message: "Workflow not found" });
        }

        if (req.user?.userId && workflow.created_by && workflow.created_by.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to update this workflow" });
        }

        if (name !== undefined) workflow.name = name;
        if (description !== undefined) workflow.description = description;
        if (Array.isArray(nodes)) workflow.nodes = nodes;
        if (Array.isArray(edges)) workflow.edges = edges;

        await workflow.save();

        return res.status(200).json({
            message: "Workflow updated successfully",
            workflow
        });
    } catch (error) {
        return next(error);
    }
};

const deleteWorkflow = async (req, res, next) => {
    try {
        const { workflowId } = req.params;

        const workflow = await Workflow.findById(workflowId);

        if (!workflow) {
            return res.status(404).json({ message: "Workflow not found" });
        }

        if (req.user?.userId && workflow.created_by && workflow.created_by.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to delete this workflow" });
        }

        await workflow.deleteOne();

        return res.status(200).json({ message: "Workflow deleted successfully" });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createWorkflow,
    getWorkflows,
    getWorkflowById,
    updateWorkflow,
    deleteWorkflow
};
