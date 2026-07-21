const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function askGemini(message) {

    try {

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        const prompt = `
You are Smart Bharat Assistant.

You are an AI Government Scheme Assistant for India.

Your job is to help citizens with:

• Government Schemes
• Eligibility
• Required Documents
• Benefits
• Application Process
• Scholarships
• Farmer Schemes
• Women Welfare
• Pension Schemes
• MSME Schemes
• Startup Schemes

If the user asks something unrelated, politely answer it briefly and guide them back to government schemes.

User Question:
${message}
`;

        const result = await model.generateContent(prompt);

        const response = await result.response;

        return response.text();

    } catch (error) {

    console.error("================================");
    console.error("Gemini Error");
    console.error(error);
    console.error(error.message);

    if (error.response) {
        console.error(error.response);
    }

    console.error("================================");

    return "Sorry, I'm unable to answer right now.";

}

}

module.exports = askGemini;