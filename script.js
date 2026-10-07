const questions = [
  {
    title: "¿Qué te parece decir que te quiero?",
    text: "Es que, aunque te conozco poco, me hizo feliz encontrarte.",
    subtext: "No hay respuestas incorrectas cuando hay cariño.",
    number: 1
  },
  {
    title: "¿Quieres compartir algunos días bonitos?",
    text: "Quiero que veas el mundo a través de mis ojos y que yo vea el tuyo desde el mío.",
    subtext: "Cada conversación, sonrisa y aventura puede empezar aquí.",
    number: 2
  },
  {
    title: "¿Quieres que este sea nuestro inicio?",
    text: "No importa si es un juego, una canción o un sueño: quiero que estés aquí.",
    subtext: "Si me dices sí, empezaremos algo precioso.",
    number: 3
  }
];

const elements = {
  hero: document.querySelector("#hero"),
  quiz: document.querySelector("#quiz"),
  result: document.querySelector("#result"),
  startButton: document.querySelector("#start-button"),
  restartButton: document.querySelector("#restart-button"),
  yesButton: document.querySelector("#yes-button"),
  noButton: document.querySelector("#no-button"),
  questionTitle: document.querySelector("#question-title"),
  questionText: document.querySelector("#question-text"),
  questionSubtext: document.querySelector("#question-subtext"),
  questionNumber: document.querySelector("#question-number"),
  progressLabel: document.querySelector("#progress-label"),
  progressFill: document.querySelector("#progress-fill"),
  dodgeHint: document.querySelector("#dodge-hint"),
  toast: document.querySelector("#toast"),
  soundButton: document.querySelector("#sound-button"),
  songUrl: document.querySelector("#song-url"),
  backgroundAudio: document.querySelector("#background-audio")
};

let currentQuestion = 0;
let noAttempts = 0;
let toastTimer;

function updateSoundButton() {
  const isPlaying = !elements.backgroundAudio.paused;
  elements.soundButton.setAttribute("aria-pressed", String(isPlaying));
  elements.soundButton.setAttribute("aria-label", isPlaying ? "Pausar música de fondo" : "Activar música de fondo");
  elements.soundButton.querySelector(".sound-label").textContent = isPlaying ? "Pausar" : "Música";
}

function setSongUrl() {
  const url = elements.songUrl.value.trim();

  if (!url) {
    showToast("Pega el enlace directo de una canción.");
    elements.songUrl.focus();
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.protocol.startsWith("http")) throw new Error("URL inválida");
  } catch {
    showToast("El enlace de la canción no es válido.");
    elements.songUrl.focus();
    return false;
  }

  elements.backgroundAudio.src = url;
  elements.backgroundAudio.load();
  return true;
}

async function startMusic() {
  if (!setSongUrl()) return;

  try {
    await elements.backgroundAudio.play();
    updateSoundButton();
  } catch {
    showToast("No se pudo reproducir el enlace. Comprueba que sea un audio directo.");
  }
}

function stopMusic() {
  elements.backgroundAudio.pause();
  updateSoundButton();
}

function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function moveNoButton() {
  if (window.matchMedia("(max-width: 620px)").matches) {
    return;
  }

  const row = elements.yesButton.parentElement;
  const rowWidth = row.clientWidth;
  const rowHeight = row.clientHeight;
  const x = 18 + Math.random() * Math.max(0, rowWidth - 90);
  const y = 18 + Math.random() * Math.max(0, rowHeight - 48);
  const rotation = -9 + Math.random() * 18;

  elements.noButton.style.setProperty("--x", `${x}px`);
  elements.noButton.style.setProperty("--y", `${y}px`);
  elements.noButton.style.setProperty("--rotation", `${rotation}deg`);
  elements.noButton.classList.add("moving");
  noAttempts += 1;
  elements.dodgeHint.textContent = noAttempts < 3
    ? "El botón “No quiero” quiere mantenerse cerca de ti."
    : "¡No te dejaré sin respuesta! Solo el “Sí, quiero” cuenta.";
}

function showQuestion(index) {
  const question = questions[index];
  currentQuestion = index;
  elements.questionTitle.textContent = question.title;
  elements.questionText.textContent = question.text;
  elements.questionSubtext.textContent = question.subtext;
  elements.questionNumber.textContent = question.number;
  elements.progressLabel.textContent = `${question.number} / ${questions.length}`;
  elements.progressFill.style.width = `${(question.number / questions.length) * 100}%`;
  elements.noButton.classList.remove("moving", "cannot-click");
  elements.noButton.style.removeProperty("--x");
  elements.noButton.style.removeProperty("--y");
  elements.noButton.style.removeProperty("--rotation");
  elements.dodgeHint.textContent = "El botón “No quiero” quiere mantenerse cerca de ti.";
  noAttempts = 0;
}

function startGame() {
  elements.hero.hidden = true;
  elements.result.hidden = true;
  elements.quiz.hidden = false;
  showQuestion(0);
  window.scrollTo({ top: 80, behavior: "smooth" });
}

function finishGame() {
  elements.quiz.hidden = true;
  elements.result.hidden = false;
  elements.result.querySelector("#result-message").textContent =
    "Eres mi razón para sonreír, para disfrutar el día y para creer que el amor puede comenzar con un simple gesto. Hoy empezamos algo bonito.";
  window.scrollTo({ top: 50, behavior: "smooth" });
}

function advanceQuestion() {
  if (currentQuestion < questions.length - 1) {
    showQuestion(currentQuestion + 1);
    showToast("Pregunta siguiente ✨");
  } else {
    finishGame();
  }
}

elements.startButton.addEventListener("click", startGame);
elements.yesButton.addEventListener("click", advanceQuestion);
elements.restartButton.addEventListener("click", () => {
  elements.result.hidden = true;
  elements.hero.hidden = false;
  elements.quiz.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

elements.soundButton.addEventListener("click", () => {
  if (!elements.backgroundAudio.paused) {
    stopMusic();
  } else {
    startMusic();
  }
});

elements.songUrl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") startMusic();
});

elements.backgroundAudio.addEventListener("play", updateSoundButton);
elements.backgroundAudio.addEventListener("pause", updateSoundButton);
elements.backgroundAudio.addEventListener("ended", updateSoundButton);

elements.noButton.addEventListener("pointerenter", moveNoButton);
elements.noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveNoButton();
  elements.noButton.classList.add("cannot-click");
});
elements.noButton.addEventListener("click", (event) => {
  event.preventDefault();
  if (!elements.noButton.classList.contains("cannot-click")) {
    moveNoButton();
  }
});

window.addEventListener("pointermove", (event) => {
  if (event.target !== elements.noButton && elements.noButton.offsetParent) {
    const rect = elements.noButton.getBoundingClientRect();
    const distance = Math.hypot(
      event.clientX - (rect.left + rect.width / 2),
      event.clientY - (rect.top + rect.height / 2)
    );

    if (distance < 70 && !elements.noButton.classList.contains("cannot-click")) {
      moveNoButton();
    }
  }
});
