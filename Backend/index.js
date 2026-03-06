require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const os = require("os");

// Load Services & Routes (Person 1)
const workflowRunsRoutes = require("./routes/workflowRuns.routes");
const messagesRoutes = require("./routes/messages.routes");
const workflowCollaboration = require("./sockets/workflowCollaboration");
const { initWorker } = require("./workers/jobWorker");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
workflowCollaboration(server);

// Initialize Background Worker
initWorker();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

/* MongoDB connection */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Mongo connected");
    })
    .catch((err) => {
        console.error("Mongo connection error:", err);
    });

/* Routes */
app.use("/api", workflowRunsRoutes);
app.use("/api/messages", messagesRoutes);

/* Root route */
app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

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
});