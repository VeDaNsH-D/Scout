const express = require("express");
const protect = require("../middleware/auth_middleware");
const { validateObjectId, requireFields } = require("../middleware/validation_middleware");
const {
    createWorkflow,
    getWorkflows,
    getWorkflowById,
    updateWorkflow,
    deleteWorkflow
} = require("../controllers/workflow.controller");

const router = express.Router();

router.post("/", protect, requireFields(["name"]), createWorkflow);
router.get("/", protect, getWorkflows);
router.get("/:workflowId", protect, validateObjectId("workflowId"), getWorkflowById);
router.put("/:workflowId", protect, validateObjectId("workflowId"), updateWorkflow);
router.delete("/:workflowId", protect, validateObjectId("workflowId"), deleteWorkflow);

module.exports = router;
