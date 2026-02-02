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

type Role = "user" | "assistant";
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
    "Be really friendly and lovely and add a bit of humor 😊",
  );

  const roomsCollection = collection(db, "rooms");
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    const room = rooms.find((r) => r.id === activeRoom.id);
    if (!room) return;

    setMessages(room.messages ?? []);
  }, [activeRoom, rooms]);

  //user type something to ai
  const handleClick = async () => {
    if (!text) return;

    let room = activeRoom;
    if (!room) {
      const roomDoc = await addDoc(roomsCollection, {
        userId: auth.currentUser!.uid,
        title: "New Chat",
        titleGenerated: false,
        messages: [],
      });
      room = {
        id: roomDoc.id,
        userId: user.uid,
        title: "New chat",
        titleGenerated: false,
        messages: [],
      };
      setActiveRoom(room);
    }

    const roomId = room.id;
    if (!roomId) return;
    setLoading(true);
    const message: Message = {
      role: "user",
      content: text,
    };
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);

    await updateDoc(doc(db, "rooms", roomId), {
      messages: updatedMessages,
    });
    setText("");

    try {
      if (messages.length === 0) {
        const titleRes = await fetch("/api/room-title", {
          method: "POST",
          body: JSON.stringify({
            roomId,
            firstMessage: text,
          }),
        });
        const data = await titleRes.json();
        const title = data.title;
        await updateDoc(doc(db, "rooms", roomId), {
          title,
          titleGenerated: true,
        });
        getRooms(auth.currentUser!.uid);
      }
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, message], prompt }),
      });
      if (!res.ok) throw new Error("Request failed");

      const aiMessage: Message = { role: "assistant", content: "" };
      setMessages((prev) => [...prev, aiMessage]);

      const reader = res.body?.getReader();
      let done = false;
      let content = "";
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
            await new Promise((res) => setTimeout(res, 20));
          }
        }
      }
      const aiMes: Message = {
        role: "assistant",
        content,
      };

      const finalMessages = [...updatedMessages, aiMes];

      setMessages(finalMessages);

      await updateDoc(doc(db, "rooms", roomId), {
        messages: finalMessages,
      });
    } catch (error) {
      console.error(error);
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
        <p>Choose temper:</p>
        <select
          className="selector"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        >
          <option
            value={"Be really friendly and lovely and add a bit of humor 😊"}
          >
            Friendly
          </option>
          <option value={"Be angry and hatefull to user"}>Angry</option>
        </select>
      </div>
    </div>
  );
};
