const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all schemes
router.get("/", async (req, res) => {
    try {

        const [rows] = await db.query(
            "SELECT * FROM schemes WHERE status='Active' ORDER BY scheme_name"
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

// Get single scheme
router.get("/:id", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT * FROM schemes WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Scheme Not Found"
            });

        }

        res.json({
            success: true,
            scheme: rows[0]
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