# CodeShare

Real-time collaborative code editor powered by **Monaco Editor**, **Yjs (CRDT)**, and **Socket.io**.

## Features

- ⚡ **Real-Time Collaboration**: Peer-to-peer style conflict-free editing powered by Yjs and WebSockets.
- 💻 **Monaco Editor Integration**: Rich code editing experience (VS Code's editor in the browser) with syntax highlighting, autocomplete, and language selection.
- 🚪 **Room-Based Collaboration**: Create or join isolated rooms via unique room codes.
- 🎨 **Modern Dark UI**: Clean, responsive interface with code formatting, language switching, and connection indicators.

---

## Project Structure

```text
codeshare/
├── client/          # Frontend client built with Vite & Monaco Editor
│   ├── index.html   # Landing page to create or join a room
│   ├── room.html    # Collaborative editor room
│   └── src/         # Client assets and script logic
└── server/          # Node.js backend with Express & Socket.io
    └── server.js    # WebSocket & Yjs sync server
```

---

## Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

---

### 2. Setup Server

```bash
cd server
npm install
npm run dev
```

The collaboration server will start at `http://localhost:3000`.

---

### 3. Setup Client

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

Open the Vite local development URL (usually `http://localhost:5173`) in your browser.

---

## Tech Stack

- **Client**: Vite, Vanilla JavaScript, Monaco Editor, Yjs, y-monaco, y-socket.io, Socket.io Client
- **Server**: Node.js, Express, Socket.io, y-socket.io
