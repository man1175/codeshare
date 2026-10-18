
import * as monaco from "monaco-editor";
import { io } from "socket.io-client";

const params = new URLSearchParams(window.location.search);
const roomId = params.get("room");

if (!roomId) {
  window.location.replace("/");
} else {
  startRoom();
}

function startRoom() {
  document.querySelector("#roomId").textContent = roomId;

  const editor = monaco.editor.create(
    document.querySelector("#editor"),
    {
      value: "// Connecting to CodeShare...\n",
      language: "javascript",
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false
    }
  );

  const languageSelect = document.querySelector("#languageSelect");
  const connectionStatus = document.querySelector("#connectionStatus");
  const userCount = document.querySelector("#userCount");
  const editorMessage = document.querySelector("#editorMessage");

  const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

  const socket = io(SERVER_URL);

  let applyingRemoteChange = false;
  let joinedRoom = false;

  socket.on("connect", () => {
    connectionStatus.textContent = "Connected";
    socket.emit("room:join", { roomId });
  });

  socket.on("disconnect", () => {
    connectionStatus.textContent = "Reconnecting...";
    joinedRoom = false;
  });

  socket.on("connect_error", (error) => {
    connectionStatus.textContent = "Connection failed";
    editorMessage.textContent = error.message;
  });

  // Receive the room's current code and language
  socket.on("room:state", ({ code, language }) => {
    applyingRemoteChange = true;

    editor.setValue(code);
    monaco.editor.setModelLanguage(editor.getModel(), language);
    languageSelect.value = language;

    applyingRemoteChange = false;
    joinedRoom = true;
    editorMessage.textContent = "Room synchronized.";
  });

  // Receive edits from other users
  socket.on("editor:update", ({ code }) => {
    if (editor.getValue() === code) return;

    applyingRemoteChange = true;
    editor.setValue(code);
    applyingRemoteChange = false;
  });

  // Send local edits to the server
  editor.onDidChangeModelContent(() => {
    if (!applyingRemoteChange && joinedRoom) {
      socket.emit("editor:change", {
        roomId,
        code: editor.getValue()
      });
    }
  });

  socket.on("room:users", ({ count }) => {
    userCount.textContent = count;
  });

  languageSelect.addEventListener("change", () => {
    const language = languageSelect.value;

    monaco.editor.setModelLanguage(editor.getModel(), language);

    if (joinedRoom) {
      socket.emit("editor:language", { roomId, language });
    }
  });

  socket.on("editor:language:update", ({ language }) => {
    languageSelect.value = language;
    monaco.editor.setModelLanguage(editor.getModel(), language);
  });

  document.querySelector("#copyLinkBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      editorMessage.textContent = "Invite link copied!";
    } catch {
      editorMessage.textContent =
        "Copy failed. Copy the URL from your browser address bar.";
    }
  });

  document.querySelector("#downloadBtn").addEventListener("click", () => {
    const blob = new Blob([editor.getValue()], {
      type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `codeshare-${roomId}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  });
}
