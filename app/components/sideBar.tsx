"use client";
import { auth, db } from "@/firebase/firebase-config";
import {
  getDocs,
  query,
  where,
  collection,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "@/styles/sidebar.css";

export interface Room {
  id?: string;
  title: string;
  userId: string | undefined;
  titleGenerated: boolean;
  messages: {}[];
}
interface SideBarProps {
  activeRoom: Room | null;
  setActiveRoom: (room: Room | null) => void;
  getRooms: (uid: string | undefined) => void;
  rooms: any[];
  setRooms: React.Dispatch<React.SetStateAction<any[]>>;
  user: any;
}
export const SideBar = ({
  activeRoom,
  setActiveRoom,
  getRooms,
  rooms,
  setRooms,
  user,
}: SideBarProps) => {
  const roomsCollection = collection(db, "rooms");
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        getRooms(user.uid);
      } else {
        setRooms([]);
      }
    });

    return () => unsub();
  }, []);

  const handleAdd = async () => {
    setActiveRoom(null);
  };
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "rooms", id));
    setActiveRoom(null);
  };
  return (
    <div className="sidebar">
      <button className="newChatButton" onClick={handleAdd}>
        New Chat
      </button>
      {rooms.map((room, i) => {
        return (
          <div
            className="room"
            key={room.id}
            onClick={() => {
              setActiveRoom(room);
              getRooms(auth?.currentUser?.uid);
            }}
          >
            <p>{room.title}</p>
            <button
              onClick={() => handleDelete(room.id)}
              className="deleteButton"
            >
              ❌
            </button>
          </div>
        );
      })}
    </div>
  );
};
