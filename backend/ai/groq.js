async function askGroq(messages) {

    try {

        const completion = await groq.chat.completions.create({

            model: "llama-3.3-70b-versatile",

            messages,

            temperature: 0.3,

            max_tokens: 800,

            top_p: 0.9,

            frequency_penalty: 0.2,

            presence_penalty: 0.1

        });

        let reply = completion.choices[0].message.content || "";

        /* ==========================================
           Improve Readability
        ========================================== */

        reply = reply

            .replace(/\r/g, "")

            .replace(/\n{3,}/g, "\n\n")

            .replace(/•/g, "• ")

            .replace(/^\-\s/gm, "• ")

            .trim();

        return reply;

    }

    catch (err) {

        console.error("================================");
        console.error("❌ Groq Error");
        console.error(err);
        console.error("================================");

        return "Sorry, Smart Bharat AI is temporarily unavailable.";

    }

}