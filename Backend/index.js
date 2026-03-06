require("dotenv").config();

const express = require("express");
const cors = require("cors");
const os = require("os");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth_routes");
const leadRoutes = require("./routes/lead_routes");

const app = express();

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

/* Start server */
app.listen(PORT, () => {

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