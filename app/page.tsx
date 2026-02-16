"use client";
import { useEffect, useState } from "react";
import { Chat } from "@/app/components/chat";
import "@/styles/chat.css";
import { SignInButton } from "./components/signinButton";
import { SignOutButton } from "./components/signOutButton";

import { redirect } from "next/navigation";
import type { Room } from "./components/sideBar";
import { SideBar } from "./components/sideBar";
import { getDocs, query, where, collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
export default function Home() {
  const [user, setUser] = useState<any>();

  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // тут точно буде user або null
    });

    return () => unsubscribe();
  }, []);

  const roomsCollection = collection(db, "rooms");
  const getRooms = async (uid?: string) => {
    try {
      if (!uid) return;
      const q = query(roomsCollection, where("userId", "==", uid));

      const data = await getDocs(q);
      const filteredData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRooms(filteredData);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <main className="main">
      <h1>Max AI</h1>
      <Chat
        activeRoom={activeRoom}
        user={user}
        getRooms={getRooms}
        rooms={rooms}
        setRooms={setRooms}
        setActiveRoom={setActiveRoom}
      />
      {!user ? <SignInButton /> : null}
      {user && <SignOutButton />}
      <SideBar
        setActiveRoom={setActiveRoom}
        activeRoom={activeRoom}
        getRooms={getRooms}
        rooms={rooms}
        setRooms={setRooms}
        user={user}
      />
    </main>
  );
}
