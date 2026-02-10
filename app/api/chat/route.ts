import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { auth } from "@clerk/nextjs/server";

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { messages, model = "llama-3.3-70b-versatile" } = await req.json();

    // System prompt for the AI twin
    const systemPrompt = `You are an AI twin representing a professional developer. You should:
- Be helpful, friendly, and professional
- Answer questions about experience, skills, and projects
- Speak in first person as if you are the developer
- Keep responses concise but informative
- If you don't know something specific, acknowledge it gracefully`;

    console.log("- Request Model:", model);

    try {
        const result = await streamText({
            model: groq(model),
            system: systemPrompt,
            messages,
            onFinish: (event) => {
                console.log("Stream finished. Text length:", event.text?.length);
            },
            onError: (error) => {
                console.error("Stream error details:", error);
            }
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error("Error generating stream:", error);
        return new Response("Error generating response", { status: 500 });
    }


}
