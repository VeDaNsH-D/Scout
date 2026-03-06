const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const { validateObjectId } = require("../middleware/validation_middleware")

const {
    uploadLeads,
    getLeads,
    getLeadById,
    deleteLead
} = require("../controllers/lead_controller")

const allowedExtensions = new Set([".csv", ".xlsx", ".xls"])

const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase()

        if (!allowedExtensions.has(ext)) {
            return cb(new Error("Only CSV or Excel files are allowed"))
        }

        return cb(null, true)
    }
})

/* CSV upload */
router.post("/upload", upload.single("file"), uploadLeads)

/* Lead management */
router.get("/", getLeads)
router.get("/:id", validateObjectId("id"), getLeadById)
router.delete("/:id", validateObjectId("id"), deleteLead)

module.exports = router