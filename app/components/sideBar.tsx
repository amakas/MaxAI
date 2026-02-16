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
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "@/styles/sidebar.css";
import { PopUp } from "./Popup";
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
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [open, setOpen] = useState(true);
  const [popUp, setPopUp] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setWindowWidth(window.innerWidth);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  let isMobile = false;
  if (windowWidth) {
    isMobile = windowWidth < 800;
  }
  useEffect(() => {
    const handleClickOut = (e: any) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    console.log(open);
    if (isMobile) {
      document.addEventListener("click", handleClickOut);
      return () => document.removeEventListener("click", handleClickOut);
    }
  }, [isMobile]);
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
    if (!user) {
      setPopUp(true);
      setTimeout(() => {
        setPopUp((prev) => !prev);
      }, 3000);
    }

    setActiveRoom(null);
  };
  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "rooms", id));
    getRooms(user.uid);
    setActiveRoom(null);
  };
  return (
    <div ref={navRef}>
      <button
        className={`burger ${open ? "hide" : "open"}`}
        onClick={() => setOpen(true)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div
        className={`sidebar ${isMobile ? "mobile" : ""} ${open ? "show" : "closing"}`}
      >
        <button className="newChatButton" onClick={handleAdd}>
          New Chat
        </button>
        <button className={`burger op`} onClick={() => setOpen(false)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="rooms">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(room.id);
                  }}
                  className="deleteButton"
                >
                  ❌
                </button>
              </div>
            );
          })}
        </div>
      </div>
      {popUp && <PopUp />}
    </div>
  );
};
