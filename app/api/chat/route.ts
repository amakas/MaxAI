export const runtime = "nodejs";
import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_KEY!,
});

export async function POST(req: Request) {
  const { messages: userMessages, prompt } = await req.json();
  if (!process.env.OPENROUTER_KEY) {
    throw new Error("OPENROUTER_KEY is missing");
  }
  console.log(process.env.OPENROUTER_KEY);
  const systemPrompt = `${prompt} `;
  const messages = [{ role: "system", content: systemPrompt }, ...userMessages];
  const stream = await openrouter.chat.send({
    model: "tngtech/deepseek-r1t2-chimera:free",
    messages,
    stream: true,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content;
        if (text) {
          controller.enqueue(new TextEncoder().encode(text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
