const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/* ==========================================
   Smart Bharat AI
========================================== */

async function askGroq(messages) {

    try {

        const completion = await groq.chat.completions.create({

            model: "llama-3.3-70b-versatile",

            messages,

            temperature: 0.5,

            max_tokens: 500

        });

        return completion.choices[0].message.content;

    }

    catch (err) {

        console.error("================================");
        console.error("❌ Groq Error");
        console.error(err);
        console.error("================================");

        return "Sorry, Smart Bharat AI is temporarily unavailable.";

    }

}

module.exports = askGroq;