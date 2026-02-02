"use client";
import { auth } from "@/firebase/firebase-config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
export const SignOutButton = () => {
  const router = useRouter();
  return (
    <button
      className="signOutButton"
      onClick={() => {
        auth.signOut();
        router.push("/auth");
      }}
    >
      Sign out{" "}
    </button>
  );
};
