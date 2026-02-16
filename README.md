# Max AI Chat

Simple full-stack AI chat application demonstrating authentication, database integration, streaming responses, and dynamic UI state management. Built with **Next.js**, **Firebase**, and **OpenRouter**.

---

## 🚀 Features

- Guest mode (chat without login)
- Authentication (Email/Password + Google)
- Persistent chat rooms (Firestore)
- Streaming AI responses
- Auto-generated room titles
- AI personality selector (Friendly / Angry / Skibidy)
- Responsive sidebar with room management

---

## 🛠 Tech Stack

- **Next.js (App Router)**
- **React + TypeScript**
- **Firebase Auth**
- **Firebase Firestore**
- **OpenRouter API (Streaming)**

---

## 🔐 Environment Variables

Create `.env.local`:

```env
OPENROUTER_KEY=your_key
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Run Locally
```
npm install
npm run dev
```

