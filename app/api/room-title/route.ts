import { OpenRouter } from "@openrouter/sdk";
import { db } from "@/firebase/firebase-config";
import { doc, updateDoc } from "firebase/firestore";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_KEY!,
});

export async function POST(req: Request) {
  const { roomId, firstMessage, userId } = await req.json();

  const completion = await openrouter.chat.send({
    model: "tngtech/deepseek-r1t2-chimera:free",
    messages: [
      {
        role: "system",
        content:
          "Generate a very short, concise, natural chat title based on user message ( not more than 5 words). No quotes.",
      },
      {
        role: "user",
        content: firstMessage,
      },
    ],
  });
  console.log("roomId:", roomId);

  const content = completion?.choices?.[0]?.message?.content;

  const title = typeof content === "string" ? content : "New chat";
  console.log("title:", title);

  return Response.json({ title });
}
