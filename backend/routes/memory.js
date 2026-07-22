const express = require("express");
const router = express.Router();
const db = require("../db");

/* ==========================================
   Save Memory
========================================== */

router.post("/save", async (req, res) => {

    try {

        const { email, memory } = req.body;

        if (!email || !memory) {

            return res.status(400).json({
                success: false,
                message: "Email and memory are required."
            });

        }

        await db.query(
            "INSERT INTO user_memory (email, memory) VALUES (?, ?)",
            [email, memory]
        );

        res.json({
            success: true,
            message: "Memory saved successfully."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Failed to save memory."
        });

    }

});


/* ==========================================
   Get User Memories
========================================== */

router.get("/:email", async (req, res) => {

    try {

        const email = req.params.email;

        const [rows] = await db.query(
            "SELECT id, memory, created_at FROM user_memory WHERE email=? ORDER BY created_at DESC",
            [email]
        );

        res.json({
            success: true,
            memories: rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Failed to load memories."
        });

    }

});


/* ==========================================
   Delete One Memory
========================================== */

router.delete("/:id", async (req, res) => {

    try {

        await db.query(
            "DELETE FROM user_memory WHERE id=?",
            [req.params.id]
        );

        res.json({
            success: true,
            message: "Memory deleted."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Delete failed."
        });

    }

});


/* ==========================================
   Delete All Memories Of User
========================================== */

router.delete("/user/:email", async (req, res) => {

    try {

        await db.query(
            "DELETE FROM user_memory WHERE email=?",
            [req.params.email]
        );

        res.json({
            success: true,
            message: "All memories deleted."
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Delete failed."
        });

    }

});

module.exports = router;