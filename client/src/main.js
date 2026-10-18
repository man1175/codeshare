
const createRoomBtn = document.querySelector("#createRoomBtn");
const joinRoomForm = document.querySelector("#joinRoomForm");
const roomIdInput = document.querySelector("#roomIdInput");
const message = document.querySelector("#message");

function generateRoomId() {
  return crypto.randomUUID().slice(0, 8);
}

function openRoom(roomId) {
  window.location.href = `/room.html?room=${encodeURIComponent(roomId)}`;
}

createRoomBtn.addEventListener("click", () => {
  openRoom(generateRoomId());
});

joinRoomForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const roomId = roomIdInput.value.trim();

  if (!roomId) {
    message.textContent = "Please enter a room ID.";
    return;
  }

  openRoom(roomId);
});
