"use client";
import { useState, useEffect, useRef } from "react";
import type { Room } from "@/app/components/sideBar";
import { db, auth } from "@/firebase/firebase-config";
import {
  doc,
  updateDoc,
  getDocs,
  addDoc,
  collection,
} from "firebase/firestore";
import { User } from "firebase/auth";

type Role = string;
interface Message {
  role: Role;
  content: string;
}
interface ChatProps {
  activeRoom: Room | null;
  user: any;
  getRooms: (uid: string | undefined) => void;
  rooms: any[];
  setRooms: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveRoom: React.Dispatch<React.SetStateAction<any>>;
}
export const Chat = ({
  activeRoom,
  user,
  getRooms,
  rooms,
  setRooms,
  setActiveRoom,
}: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const lastRef = useRef<null | HTMLDivElement>(null);
  const [prompt, setPrompt] = useState(
    "Respond in a professional, clear and structured manner. Provide concise explanations and avoid unnecessary emojis.",
  );

  const roomsCollection = collection(db, "rooms");
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    const room = rooms.find((r) => r.id === activeRoom.id);
    if (!room) return;

    setMessages((room.messages ?? []) as Message[]);
  }, [activeRoom, rooms]);

  //user type something to ai
  const askAI = async (messages: Message[]) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, prompt }),
    });

    if (!res.ok) throw new Error("Request failed");

    const reader = res.body?.getReader();
    let done = false;
    let content = "";

    const aiMessage: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, aiMessage]);

    while (!done) {
      const { value, done: readerDone } = await reader!.read();
      done = readerDone;

      if (value) {
        const chunk = new TextDecoder().decode(value);

        for (const char of chunk) {
          content += char;

          setMessages((prev) => {
            const last = [...prev];
            last[last.length - 1] = {
              ...last[last.length - 1],
              content,
              role: "assistant",
            };
            return last;
          });
        }
      }
    }

    return content;
  };
  const handleClick = async () => {
    if (!text || loading) return;

    setLoading(true);

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setText("");

    try {
      // =========================
      // GUEST MODE (no user)
      // =========================
      if (!user) {
        const aiContent = await askAI(updatedMessages);

        const finalMessages = [
          ...updatedMessages,
          { role: "assistant", content: aiContent },
        ];

        setMessages(finalMessages);
        return; // ВАЖЛИВО: не йдемо в Firebase
      }

      // =========================
      // AUTH MODE (user exists)
      // =========================

      let room = activeRoom;

      // якщо кімнати ще нема — створюємо
      if (!room) {
        const roomDoc = await addDoc(roomsCollection, {
          userId: user.uid,
          title: "New Chat",
          titleGenerated: false,
          messages: [],
        });

        room = {
          id: roomDoc.id,
          userId: user.uid,
          title: "New Chat",
          titleGenerated: false,
          messages: [],
        };

        setActiveRoom(room);
      }

      const roomId = room.id!;

      // зберігаємо user message
      await updateDoc(doc(db, "rooms", roomId), {
        messages: updatedMessages,
      });

      // генеруємо title тільки на першому повідомленні
      if (messages.length === 0) {
        const titleRes = await fetch("/api/room-title", {
          method: "POST",
          body: JSON.stringify({
            roomId,
            firstMessage: text,
          }),
        });

        const data = await titleRes.json();

        await updateDoc(doc(db, "rooms", roomId), {
          title: data.title,
          titleGenerated: true,
        });

        getRooms(user.uid);
      }

      // AI response
      const aiContent = await askAI(updatedMessages);

      const finalMessages = [
        ...updatedMessages,
        { role: "assistant", content: aiContent },
      ];

      setMessages(finalMessages);

      await updateDoc(doc(db, "rooms", roomId), {
        messages: finalMessages,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lastRef.current) {
      lastRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  useEffect(() => {}, []);
  return (
    <div className="chat">
      <div className="messages-container">
        {messages.length === 0 && (
          <h2 className="main-message">How can i help you today?</h2>
        )}
        {messages?.map((message, i) => {
          return (
            <div key={i} className="message-container">
              {message.role === "user" ? (
                <div className="my message">
                  {" "}
                  <p className="content">{message.content}</p>
                </div>
              ) : (
                <div className="ai message">
                  <p className="content"> {message.content}</p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={lastRef}> </div>
      </div>

      <form
        className="input-send"
        onSubmit={(e) => {
          e.preventDefault();
          handleClick();
        }}
      >
        <input
          className="input"
          placeholder="Your message..."
          disabled={loading ? true : false}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoCapitalize="true"
          autoComplete="true"
          autoFocus
        ></input>
        <button disabled={loading ? true : false} className="send-button">
          ➤
        </button>
      </form>
      <div className="temper">
        <p>Assistant Mode:</p>
        <select
          className="selector"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        >
          <option value="Respond in a professional, clear and structured manner. Provide concise explanations and avoid unnecessary emojis.">
            Professional
          </option>

          <option value="Respond in a warm, friendly and supportive tone. Be encouraging and positive, but keep answers helpful and clear.">
            Friendly
          </option>

          <option value="Respond as a senior technical expert. Provide precise, detailed explanations with structured reasoning and examples when appropriate.">
            Technical
          </option>

          <option value="Explain concepts step by step like a patient mentor. Break down complex ideas into simple parts and guide the user clearly.">
            Mentor
          </option>

          <option value="Respond creatively with original ideas and thoughtful insights. Use engaging language while keeping answers useful and relevant.">
            Creative
          </option>

          <option value="Provide short, direct and to-the-point answers. Avoid long explanations unless explicitly requested.">
            Concise
          </option>

          <option value="Respond analytically. Structure answers logically, consider multiple perspectives, and provide reasoned conclusions.">
            Analytical
          </option>

          <option value="Respond like a motivational coach. Be inspiring, confident and energizing while still providing practical advice.">
            Motivational
          </option>
        </select>
      </div>
    </div>
  );
};
