"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/firebase/firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import "@/styles/auth.css";

export default function Auth() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  console.log(auth.currentUser?.email);
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };
  const handleAuth = async () => {
    if (!email || !password) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);

      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="auth-page">
      <h2>Sign In</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAuth();
        }}
        className="signin"
      >
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="signinbut" type="submit">
          SignIn
        </button>
      </form>

      <button className="signGoogle" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}
