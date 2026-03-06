const express = require("express")
const router = express.Router()
const multer = require("multer")

const { uploadLeads } = require("../controllers/lead_controller")

const upload = multer({ dest: "uploads/" })

router.post("/upload", upload.single("file"), uploadLeads)

module.exports = router