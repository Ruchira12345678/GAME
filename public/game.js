const socket = io("https://SriLankaTugOfWar.vercel.app"); // Example backend URL
const room = prompt("Enter a room name to join:");
socket.emit("joinRoom", room);

let playerScore = 0;
let opponentScore = 0;

const rope = document.getElementById("rope");
const resultText = document.getElementById("resultText");
const playerScoreEl = document.getElementById("playerScore");
const opponentScoreEl = document.getElementById("opponentScore");
const pullBtn = document.getElementById("pullBtn");

pullBtn.addEventListener("click", () => {
  socket.emit("pull");
  document.getElementById("pullSound").play();
  rope.classList.remove("rope-animation");
  void rope.offsetWidth;
  rope.classList.add("rope-animation");
});

socket.on("waiting", () => {
  resultText.textContent = "Waiting for another player...";
  pullBtn.disabled = true;
});

socket.on("startGame", () => {
  resultText.textContent = "Game started! Pull the rope!";
  pullBtn.disabled = false;
});

socket.on("roundResult", ({ winner, playerStrength, opponentStrength }) => {
  if (winner === "player") {
    playerScore++;
    resultText.textContent = `You pulled harder! 💪 (${playerStrength} vs ${opponentStrength})`;
    document.getElementById("winSound").play();
  } else if (winner === "opponent") {
    opponentScore++;
    resultText.textContent = `Opponent pulled harder! 😤 (${opponentStrength} vs ${playerStrength})`;
    document.getElementById("winSound").play();
  } else {
    resultText.textContent = `It's a tie! 🤝 (${playerStrength} vs ${opponentStrength})`;
    document.getElementById("tieSound").play();
  }

  playerScoreEl.textContent = playerScore;
  opponentScoreEl.textContent = opponentScore;
});
