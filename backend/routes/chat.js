const express = require("express");
const router = express.Router();

const askGemini = require("../ai/gemini");

/* ==========================================
   AI Chat Route
========================================== */

router.post("/", async (req, res) => {

    try {

        const { message } = req.body;

        if (!message || message.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Message is required."
            });

        }

        console.log("================================");
        console.log("👤 User Question:");
        console.log(message);
        console.log("================================");

        const reply = await askGemini(message);

        console.log("🤖 Gemini Reply:");
        console.log(reply);
        console.log("================================");

        return res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {

        console.error("================================");
        console.error("❌ AI Chat Route Error");
        console.error(error);
        console.error("================================");

        return res.status(500).json({
            success: false,
            message: "AI Server Error"
        });

    }

});

module.exports = router;