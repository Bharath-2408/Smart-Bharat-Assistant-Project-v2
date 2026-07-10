const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM schemes ORDER BY scheme_name"
        );

        res.json({
            success: true,
            total: rows.length,
            schemes: rows
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Database Error",
            error: err.message
        });
    }
});

module.exports = router;