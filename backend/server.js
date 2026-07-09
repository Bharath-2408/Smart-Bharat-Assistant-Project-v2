const express = require("express");
console.log("Backend starting...");
const cors = require("cors");
require("dotenv").config();

// Database Connection
require("./db");

// Routes
const userRoutes = require("./routes/users");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

// ================= HOME ROUTE =================
app.get("/", (req, res) => {
    res.send("Smart Bharat Assistant Backend Running 🚀");
});

// ================= USER ROUTES =================
app.use("/api/users", userRoutes);

// ================= INVALID ROUTE =================
app.use((req, res) => {
    res.status(404).json({
        message: "Route Not Found"
    });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        message: "Internal Server Error"
    });
});

// ================= SERVER START =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

// ================= PROCESS ERRORS =================
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});