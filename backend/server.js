const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("🚀 Smart Bharat Assistant Backend Starting...");

// Database Connection
require("./db");

// Routes
const userRoutes = require("./routes/users");
const schemeRoutes = require("./routes/schemes");
const recommendRoutes = require("./routes/recommend");
const chatRoutes = require("./routes/chat");

const app = express();

/* ==========================================
   Middlewares
========================================== */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

/* ==========================================
   Home Route
========================================== */

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "🚀 Smart Bharat Assistant Backend Running"
    });

});

/* ==========================================
   API Routes
========================================== */

app.use("/api/users", userRoutes);

app.use("/api/schemes", schemeRoutes);

app.use("/api/recommend", recommendRoutes);

app.use("/api/chat", chatRoutes);

/* ==========================================
   404 Handler (Express 5 Compatible)
========================================== */

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });

});

/* ==========================================
   Global Error Handler
========================================== */

app.use((err, req, res, next) => {

    console.error("❌ Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });

});

/* ==========================================
   Start Server
========================================== */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log("========================================");
    console.log("✅ Smart Bharat Assistant Started");
    console.log(`🌐 Server : http://localhost:${PORT}`);
    console.log("📋 Users API Loaded");
    console.log("📂 Schemes API Loaded");
    console.log("🎯 Recommendation API Loaded");
    console.log("🤖 AI Chat API Loaded");
    console.log("========================================");

});