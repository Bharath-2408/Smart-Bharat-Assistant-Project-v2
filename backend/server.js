const express = require("express");
const cors = require("cors");

console.log("Backend starting...");
console.log("🤖 Smart Bharat Assistant Backend Initialized Successfully");

require("dotenv").config();
require("./db");

const userRoutes = require("./routes/users");
const schemeRoutes = require("./routes/schemes");
const recommendRoutes = require("./routes/recommend");

console.log("Users Route Loaded ✅");
console.log("Schemes Route Loaded ✅");
console.log("Recommend Route Loaded ✅");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("🚀 Smart Bharat Assistant Backend Running");
});

app.use("/api/users", userRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/recommend", recommendRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});