const express = require("express");
const router = express.Router();

const askGroq = require("../ai/groq");

/* ==========================================
   Conversation Memory
========================================== */

const conversations = {};

/* ==========================================
   AI Chat Route
========================================== */

router.post("/", async (req, res) => {

    try {

        const { message, sessionId } = req.body;

        if (!message || message.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Message is required."
            });

        }

        const chatId = sessionId || "default";

        /* ==========================================
           Create New Conversation
        ========================================== */

        if (!conversations[chatId]) {

            conversations[chatId] = [

                {
                    role: "system",
                    content: `You are Smart Bharat Assistant.

You help users only with:

- Indian Government Schemes
- Eligibility
- Documents Required
- Benefits
- Citizen Services
- Government Portals

Rules:

1. Give short and simple answers.
2. Be polite and professional.
3. If the question is unrelated to Government Schemes or Citizen Services, politely reply:
"I can assist only with Indian Government Schemes and Citizen Services."
4. Continue the conversation using previous messages.`
                }

            ];

        }

        /* ==========================================
           Save User Message
        ========================================== */

        conversations[chatId].push({

            role: "user",
            content: message

        });

        console.log("================================");
        console.log("👤 User Question:");
        console.log(message);
        console.log("================================");

        /* ==========================================
           Ask Groq
        ========================================== */

        const reply = await askGroq(conversations[chatId]);

        /* ==========================================
           Save AI Reply
        ========================================== */

        conversations[chatId].push({

            role: "assistant",
            content: reply

        });

        /* ==========================================
           Keep Last 20 Messages
        ========================================== */

        if (conversations[chatId].length > 20) {

            conversations[chatId] = [

                conversations[chatId][0],

                ...conversations[chatId].slice(-19)

            ];

        }

        console.log("🤖 Smart Bharat Reply:");
        console.log(reply);
        console.log("================================");

        return res.status(200).json({

            success: true,
            reply

        });

    }

    catch (error) {

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