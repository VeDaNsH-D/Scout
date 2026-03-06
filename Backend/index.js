require("dotenv").config();

const express = require("express");
const cors = require("cors");
const os = require("os");
const http = require("http");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth_routes");
const leadRoutes = require("./routes/lead_routes");
const workflowRunsRoutes = require("./routes/workflowRuns.routes");
const messagesRoutes = require("./routes/messages.routes");
const workflowCollaboration = require("./sockets/workflowCollaboration");
const { initWorker } = require("./workers/jobWorker");

const app = express();
const server = http.createServer(app);

/* Middleware */
app.use(cors());
app.use(express.json());

/* MongoDB connection */
connectDB();

const PORT = process.env.PORT || 8000;

/* Root route */
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);

/* Workflow routes */
app.use("/api", workflowRunsRoutes);

/* Messages routes */
app.use("/api/messages", messagesRoutes);

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