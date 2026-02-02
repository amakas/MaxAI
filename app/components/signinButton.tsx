"use client";
import { redirect } from "next/navigation";

export const SignInButton = () => {
  return (
    <button className="signInButton" onClick={() => redirect("/auth")}>
      Sign in
    </button>
  );
};
