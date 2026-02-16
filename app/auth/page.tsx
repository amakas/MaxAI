"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/firebase/firebase-config";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "@/styles/auth.css";
const getErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Invalid email format";
    case "auth/user-not-found":
      return "User with such email address not found";
    case "auth/wrong-password":
      return "Wrong password";
    case "auth/email-already-in-use":
      return "This email is already in use";
    case "auth/weak-password":
      return "The password is too weak (minimum 6 symbols)";
    default:
      return "Invalid credentials";
  }
};
export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(true); // true = Login, false = SignUp
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState<string>("");

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err.code));
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(getErrorMessage(err.code));
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  return (
    <div className="auth-page">
      <h2>{login ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className="signin">
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
          {login ? "Login" : "Sign Up"}
        </button>
      </form>
      <div className="buttons">
        <button className="switch" onClick={() => setLogin((prev) => !prev)}>
          Switch to {login ? "Sign Up" : "Login"}
        </button>
        <button className="signGoogle" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
      </div>
      {showError && <div className="error-message">{error}</div>}
    </div>
  );
}
