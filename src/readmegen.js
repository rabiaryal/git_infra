import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs-extra';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateDeepReadme() {
    try {
        console.log("🤖 AI Agent: Analyzing code and preparing to (re)write README.md...");
        
        // 1. Gather context from your key files
        const filesToRead = ['main.js', 'src/project.js', 'src/pusher.js'];
        let context = "";
        
        filesToRead.forEach(file => {
            if (fs.existsSync(file)) {
                context += `\n--- ${file} ---\n${fs.readFileSync(file, 'utf8')}\n`;
            }
        });

        // 2. Initialize the model using your tested name
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            Act as a Senior Technical Writer. Analyze this CLI tool code:
            ${context}

            Write a high-quality README.md formatted as a Medium article.
            Include:
            - A compelling title and problem statement.
            - "How it works" section.
            - Comparison of this automated workflow vs manual git commands.
            - Use placeholders like [SCREENSHOT_HERE].
        `;

        // 3. Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const markdown = response.text();

        // 4. Overwrite README.md
        await fs.writeFile('README.md', markdown, 'utf8');
        console.log("✅ Success: README.md has been generated/overwritten.");

    } catch (error) {
        // We throw the error so main.js knows to stop and not copy old text
        throw new Error(`AI Generation failed: ${error.message}`);
    }
}