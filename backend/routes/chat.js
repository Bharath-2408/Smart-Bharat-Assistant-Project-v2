const express = require("express");
const router = express.Router();

const askGroq = require("../ai/groq");
const db = require("../db");

/* ==========================================
   Conversation Memory
========================================== */

const conversations = {};

/* ==========================================
   Supported Indian Languages
========================================== */

const supportedLanguages = [
    "English",
    "Tamil",
    "Hindi",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Gujarati",
    "Bengali",
    "Punjabi",
    "Odia",
    "Assamese",
    "Urdu"
];

/* ==========================================
   Indian States
========================================== */

const indianStates = [

    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Puducherry"

];

/* ==========================================
   Supported Occupations
========================================== */

const occupations = [

    "Student",
    "Farmer",
    "Business",
    "Businessman",
    "Self Employed",
    "Employee",
    "Government Employee",
    "Private Employee",
    "Teacher",
    "Doctor",
    "Engineer",
    "Lawyer",
    "Driver",
    "Labour",
    "Unemployed"

];

/* ==========================================
   Extract User Profile
========================================== */

function extractProfile(message) {

    const profile = {};

    let match;

    /* ---------- Name ---------- */

    match = message.match(/my name is\s+(.+)/i);

    if (match) {

        profile.name = match[1].trim();

    }

    /* ---------- Age ---------- */

    match = message.match(/(\d{1,2})\s*(years old|year old)/i);

    if (match) {

        profile.age = match[1];

    }

    /* ---------- Income ---------- */

    match = message.match(/income.*?(\d[\d,]*)/i);

    if (match) {

        profile.income = match[1].replace(/,/g, "");

    }

    /* ---------- Gender ---------- */

    if (/male/i.test(message)) {

        profile.gender = "Male";

    }

    if (/female/i.test(message)) {

        profile.gender = "Female";

    }

    /* ---------- State ---------- */

    for (const state of indianStates) {

        if (message.toLowerCase().includes(state.toLowerCase())) {

            profile.state = state;
            break;

        }

    }

    /* ---------- Occupation ---------- */

    for (const job of occupations) {

        if (message.toLowerCase().includes(job.toLowerCase())) {

            profile.occupation = job;
            break;

        }

    }

    return profile;

}

/* ==========================================
   Convert Profile To Memories
========================================== */

function profileToMemories(profile) {

    const memories = [];

    if (profile.name)
        memories.push(`Name: ${profile.name}`);

    if (profile.age)
        memories.push(`Age: ${profile.age}`);

    if (profile.gender)
        memories.push(`Gender: ${profile.gender}`);

    if (profile.state)
        memories.push(`State: ${profile.state}`);

    if (profile.occupation)
        memories.push(`Occupation: ${profile.occupation}`);

    if (profile.income)
        memories.push(`Income: ${profile.income}`);

    return memories;

}

/* ==========================================
   AI Chat Route
========================================== */

router.post("/", async (req, res) => {

    try {

        const {

            message,
            sessionId,
            email

        } = req.body;

        if (!message || message.trim() === "") {

            return res.status(400).json({

                success: false,
                message: "Message is required."

            });

        }

        const chatId = sessionId || email || "default";

        /* ==========================================
           Load User Memories
        ========================================== */

        let memoryText = "No saved memories.";

        if (email) {

            const [rows] = await db.query(

                `SELECT memory
                 FROM user_memory
                 WHERE email=?
                 ORDER BY created_at DESC
                 LIMIT 20`,

                [email]

            );

            if (rows.length > 0) {

                memoryText = rows
                    .map(item => `• ${item.memory}`)
                    .join("\n");

            }

        }

        /* ==========================================
           Create Conversation
        ========================================== */

        if (!conversations[chatId]) {

            conversations[chatId] = [

                {

                    role: "system",

                    content: `You are Smart Bharat Assistant.

You are India's AI Assistant for Government Schemes and Citizen Services.

=================================================

MISSION

Help every Indian citizen find the correct Government Schemes based on their profile.

You can assist with:

• Central Government Schemes
• State Government Schemes
• Scholarships
• Farmer Schemes
• MSME Schemes
• Startup Schemes
• Women Schemes
• Student Schemes
• Senior Citizen Schemes
• Health Schemes
• Housing Schemes
• Employment Schemes
• Pension Schemes
• Citizen Services

=================================================

LANGUAGE RULES

1. Detect the user's language automatically.
2. Always reply ONLY in the same language.
3. Never translate unless the user asks.
4. Support all major Indian languages.

=================================================

PROFILE RULES

Remember and use the user's saved profile.

Available details may include:

• Name
• State
• District
• Age
• Gender
• Occupation
• Income

Use these memories whenever relevant.

If any required detail is missing,

ask ONLY for the missing information.

Never ask everything again.

=================================================

SCHEME RULES

Always show recommendations like this:

🇮🇳 Central Government Schemes

• Scheme Name
• Eligibility
• Benefits
• Required Documents
• Application Process
• Official Website

🏛 State Government Schemes

• Scheme Name
• Eligibility
• Benefits
• Required Documents
• Application Process
• Official Website

Never mix Central and State schemes.

=================================================

FORMATTING RULES

1. Never return one long paragraph.
2. Use headings.
3. Use bullet points.
4. Leave one blank line between sections.
5. Maximum 2 sentences per paragraph.
6. Every website should be on a separate line.
7. Keep answers mobile friendly.
8. Use emojis only where helpful.
9. Keep sentences short.
10. Make responses easy to read.

=================================================

OFFICIAL WEBSITE RULES

Always prefer official Government websites.

Examples:

https://www.india.gov.in

https://www.mygov.in

https://scholarships.gov.in

https://pmkisan.gov.in

Never create fake URLs.

=================================================

VOICE ASSISTANT RULES

Responses should sound natural when read aloud.

Avoid repeating information.

Avoid very long sentences.

=================================================

UNRELATED QUESTIONS

If the question is unrelated to Government Schemes or Citizen Services,

reply:

"I can assist only with Indian Government Schemes and Citizen Services."

=================================================

USER SAVED MEMORIES

${memoryText}`

                }

            ];

        }

        else {

            conversations[chatId][0].content = `You are Smart Bharat Assistant.

You are India's AI Assistant for Government Schemes and Citizen Services.

USER SAVED MEMORIES

${memoryText}

Always follow these rules:

1. Detect the user's language automatically.
2. Reply ONLY in the same language.
3. Use the saved memories whenever relevant.
4. Never ask for information already available.
5. Show Central and State Government Schemes separately.
6. Never return one long paragraph.
7. Use headings.
8. Use bullet points.
9. Keep answers mobile friendly.
10. Use only official Government information.
11. Put every website on a separate line.
12. If any profile detail is missing, ask ONLY for that detail.`;

        }
        
        /* ==========================================
           Save User Message
        ========================================== */

        conversations[chatId].push({

            role: "user",

            content: message

        });

        console.log("================================");
        console.log("👤 User :", message);
        console.log("📧 Email :", email || "Guest");
        console.log("================================");

        /* ==========================================
           Extract User Profile
        ========================================== */

        const profile = extractProfile(message);

        const memories = profileToMemories(profile);

        /* ==========================================
           Save User Memories
        ========================================== */

        if (email && memories.length > 0) {

            for (const memory of memories) {

                const [existing] = await db.query(

                    `SELECT id
                     FROM user_memory
                     WHERE email=? AND memory=?`,

                    [email, memory]

                );

                if (existing.length === 0) {

                    await db.query(

                        `INSERT INTO user_memory
                        (email,memory)
                        VALUES (?,?)`,

                        [email, memory]

                    );

                    console.log("🧠 Memory Saved :", memory);

                }

            }

        }

        /* ==========================================
           Reload Updated Memories
        ========================================== */

        if (email) {

            const [rows] = await db.query(

                `SELECT memory
                 FROM user_memory
                 WHERE email=?
                 ORDER BY created_at DESC
                 LIMIT 20`,

                [email]

            );

            if (rows.length > 0) {

                memoryText = rows
                    .map(item => `• ${item.memory}`)
                    .join("\n");

            }

        }

        /* ==========================================
           Update AI System Prompt
        ========================================== */

        conversations[chatId][0].content = `You are Smart Bharat Assistant.

You are India's AI Government Scheme Assistant.

USER SAVED MEMORIES

${memoryText}

IMPORTANT RULES

1. Detect the user's language automatically.
2. Always reply in the same language.
3. Use short paragraphs.
4. Use headings.
5. Use bullet points.
6. Separate:

🇮🇳 Central Government Schemes

🏛 State Government Schemes

7. Never mix Central and State schemes.
8. If age, state, occupation or income is missing,
ask only for the missing information.
9. Always use saved memories whenever relevant.
10. Mention only official Government information.`;

        /* ==========================================
           Ask Groq AI
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
           Keep Only Last 30 Messages
        ========================================== */

        if (conversations[chatId].length > 30) {

            conversations[chatId] = [

                conversations[chatId][0],

                ...conversations[chatId].slice(-29)

            ];

        }

        console.log("================================");
        console.log("🤖 Smart Bharat Reply");
        console.log(reply);
        console.log("================================");

        return res.status(200).json({

            success: true,

            reply

        });

    }

    catch (error) {

        console.error("================================");
        console.error("❌ AI Chat Error");
        console.error(error);
        console.error("================================");

        return res.status(500).json({

            success: false,

            reply: "Sorry, I couldn't process your request right now. Please try again."

        });

    }

});

module.exports = router;