require("dotenv").config();

const express = require("express");
const cors = require("cors");
const os = require("os");
const http = require("http");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth_routes");
const workflowRunsRoutes = require("./routes/workflowRuns.routes");
const workflowCollaboration = require("./sockets/workflowCollaboration");
const { initWorker } = require("./workers/jobWorkers");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

/* MongoDB connection */
connectDB();

/* Root route */
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

/* Auth routes */
app.use("/api/auth", authRoutes);

/* Workflow routes */
app.use("/api", workflowRunsRoutes);

/* Initialize Socket.IO for real-time collaboration */
const io = workflowCollaboration(server);
console.log("[Server] ✅ Socket.IO initialized for real-time collaboration");

/* Initialize Job Worker for workflow processing */
const worker = initWorker();
console.log("[Server] ✅ Job worker initialized for workflow execution");

/* Start server */
server.listen(PORT, () => {

    const networkInterfaces = os.networkInterfaces();
    let networkIP = "localhost";

    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            if (net.family === "IPv4" && !net.internal) {
                networkIP = net.address;
            }
        }
    }

    console.log("Backend running on:");
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://${networkIP}:${PORT}`);
    console.log("[Server] 🚀 Workflow engine, scheduler, and real-time collaboration are active!");
});