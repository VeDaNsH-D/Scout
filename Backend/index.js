require("dotenv").config();

const express = require("express");
const cors = require("cors");
const os = require("os");
const http = require("http");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const { validateEnv } = require("./config/env");
const authRoutes = require("./routes/auth_routes");
const leadRoutes = require("./routes/lead_routes");
const workflowsRoutes = require("./routes/workflows.routes");
const workflowRunsRoutes = require("./routes/workflowRuns.routes");
const messagesRoutes = require("./routes/messages.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const workflowCollaboration = require("./sockets/workflowCollaboration");
const { initWorker } = require("./workers/jobWorker");
const requestLogger = require("./middleware/request_logger");
const { notFound, errorHandler } = require("./middleware/error_middleware");

const app = express();
const server = http.createServer(app);

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(requestLogger);

/* Validate required environment variables */
validateEnv();

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
app.use("/api/workflows", workflowsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/analytics", analyticsRoutes);

/* Workflow routes */
app.use("/api", workflowRunsRoutes);

/* Global 404 + error handling */
app.use(notFound);
app.use(errorHandler);

/* Initialize Socket.IO for real-time collaboration */
const io = workflowCollaboration(server);
console.log("[Server] ✅ Socket.IO initialized for real-time collaboration");

/* Initialize Job Worker for workflow processing */
const worker = initWorker();
console.log("[Server] ✅ Job worker initialized for workflow execution");

/* Start server */
const httpServer = server.listen(PORT, () => {

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

const shutdown = async (signal) => {
    console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);

    try {
        if (worker) {
            await worker.close();
            console.log("[Server] Job worker closed.");
        }

        httpServer.close(async () => {
            await mongoose.connection.close();
            console.log("[Server] HTTP server and MongoDB connection closed.");
            process.exit(0);
        });
    } catch (error) {
        console.error("[Server] Error during shutdown:", error.message);
        process.exit(1);
    }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
