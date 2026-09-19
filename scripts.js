const SYMBOLS = [
  { id: "favorite", label: "Favorite", icon: "favorite" },
  { id: "star", label: "Star", icon: "star" },
  { id: "face", label: "Face", icon: "face" },
  { id: "water-drop", label: "Water Drop", icon: "water_drop" },
  { id: "eco", label: "Eco", icon: "eco" },
  { id: "diamond", label: "Diamond", icon: "diamond" },
  { id: "sentiment-satisfied", label: "Sentiment Satisfied", icon: "sentiment_satisfied" },
  { id: "sunny", label: "Sunny", icon: "sunny" },
  { id: "emoji-people", label: "Emoji People", icon: "emoji_people" },
  { id: "park", label: "Park", icon: "park" },
  { id: "rocket", label: "Rocket", icon: "rocket" },
  { id: "cruelty-free", label: "Cruelty Free", icon: "cruelty_free" },
  { id: "cookie", label: "Cookie", icon: "cookie" },
  { id: "emoji-objects", label: "Emoji Objects", icon: "emoji_objects" },
  { id: "thunderstorm", label: "Thunderstorm", icon: "thunderstorm" },
  { id: "hive", label: "Hive", icon: "hive" },
  { id: "skull", label: "Skull", icon: "skull" },
  { id: "dentistry", label: "Dentistry", icon: "dentistry" },
  { id: "psychiatry", label: "Psychiatry", icon: "psychiatry" },
  { id: "neurology", label: "Neurology", icon: "neurology" },
  { id: "footprint", label: "Footprint", icon: "footprint" },
  { id: "raven", label: "Raven", icon: "raven" },
  { id: "nutrition", label: "Nutrition", icon: "nutrition" },
  { id: "bomb", label: "Bomb", icon: "bomb" },
  { id: "owl", label: "Owl", icon: "owl" },
  { id: "deceased", label: "Deceased", icon: "deceased" },
  { id: "planet", label: "Planet", icon: "planet" },
  { id: "snail", label: "Snail", icon: "snail" },
  { id: "wheat", label: "Wheat", icon: "wheat" },
  { id: "visibility", label: "Visibility", icon: "visibility" },
  { id: "local-florist", label: "Local Florist", icon: "local_florist" },
  { id: "pest-control-rodent", label: "Pest Control Rodent", icon: "pest_control_rodent" },
  { id: "pet-supplies", label: "Pet Supplies", icon: "pet_supplies" },
  { id: "hanami-dango", label: "Hanami Dango", icon: "hanami_dango" },
  { id: "waves", label: "Waves", icon: "waves" },
  { id: "spa", label: "Spa", icon: "spa" },
];

const SCORE_BY_FINISH = [120, 90, 70, 50, 40, 30, 25, 20, 15, 10];
const MAX_ROUNDS = 10;
const MAX_PLAYER_NAME_LENGTH = 16;
const SUSPICIOUS_NAME_PATTERN =
  /\b(null|undefined|nan|drop|table|select|insert|delete|update|alter|truncate|script|alert|eval|function|document|window|localstorage)\b|[<>{}[\]\\/;=]/i;
const SYMBOL_BY_ID = Object.fromEntries(SYMBOLS.map((symbol) => [symbol.id, symbol]));
let translations = [];

const lobbyScreen = document.querySelector("#lobby-screen");
const setupModal = document.querySelector("#setup-modal");
const gameScreen = document.querySelector("#game-screen");
const setupKicker = document.querySelector("#setup-kicker");
const setupTitle = document.querySelector("#setup-title");
const setupCopy = document.querySelector("#setup-copy");
const playerNameInput = document.querySelector("#player-name");
const roomCodeInput = document.querySelector("#room-code");
const roomCodeField = document.querySelector("#room-code-field");
const hostCodeBox = document.querySelector("#host-code-box");
const hostCodePreview = document.querySelector("#host-code-preview");
const chooseHostButton = document.querySelector("#choose-host-button");
const chooseJoinButton = document.querySelector("#choose-join-button");
const hostButton = document.querySelector("#host-button");
const joinButton = document.querySelector("#join-button");
const copyCodeButton = document.querySelector("#copy-code-button");
const setupBackButton = document.querySelector("#setup-back-button");
const connectionStatus = document.querySelector("#connection-status");
const roundChip = document.querySelector("#round-chip");
const boardElement = document.querySelector("#symbol-board");
const targetElement = document.querySelector("#target-symbols");
const slotsElement = document.querySelector("#selection-slots");
const scoreList = document.querySelector("#score-list");
const statusElement = document.querySelector("#round-status");
const decipherButton = document.querySelector("#decipher-button");
const newRoundButton = document.querySelector("#new-round-button");
const countdownOverlay = document.querySelector("#countdown-overlay");
const countdownHourglass = document.querySelector("#countdown-hourglass");
const countdownNumber = document.querySelector("#countdown-number");
const resultModal = document.querySelector("#result-modal");
const modalPhrase = document.querySelector("#modal-phrase");
const modalDetail = document.querySelector("#modal-detail");
const modalClose = document.querySelector("#modal-close");
const finalModal = document.querySelector("#final-modal");
const finalResults = document.querySelector("#final-results");
const homeButton = document.querySelector("#home-button");
const sounds = {
  button: new Audio("assets/sounds/buttonClick.mp3"),
  eerie: new Audio("assets/sounds/eerie-sound.wav"),
  select: new Audio("assets/sounds/rock-on-rock-scrape.wav"),
  wrong: new Audio("assets/sounds/wrong-selection.wav"),
};

const state = {
  role: null,
  peer: null,
  hostConnection: null,
  host: {
    connections: {},
    players: {},
    phraseDeck: [],
  },
  selfId: null,
  selfName: "",
  roomId: "",
  pendingHostRoomId: "",
  wall: [],
  target: [],
  selected: [],
  roundNumber: 0,
  roundId: null,
  phrase: "",
  locked: true,
  submitted: false,
  scoreboard: [],
  countdownTimers: [],
  countdownActive: false,
  gameEnded: false,
};

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const value = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = value;
  }

  return copy;
}

function makeRoomId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "LI-";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function normalizePlayerName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function validatePlayerName(value) {
  const name = normalizePlayerName(value);

  if (name.length === 0) {
    return {
      valid: false,
      message: "The ruins demand a name before they let you in.",
    };
  }

  if (name.length > MAX_PLAYER_NAME_LENGTH) {
    return {
      valid: false,
      message: `Only Elon Musk would name a child that. Keep it to ${MAX_PLAYER_NAME_LENGTH} characters.`,
    };
  }

  if (/^[\W_]+$/u.test(name)) {
    return {
      valid: false,
      message: "Are you sure that is your name, or did your keyboard fall down some stairs?",
    };
  }

  if (SUSPICIOUS_NAME_PATTERN.test(name)) {
    return {
      valid: false,
      message: "Nice try, developer. Pick a name that would survive airport security.",
    };
  }

  return {
    valid: true,
    name,
  };
}

function getSymbolIds(symbols) {
  return symbols.map((symbol) => symbol.id);
}

function getSymbolsFromIds(ids) {
  return ids.map((id) => SYMBOL_BY_ID[id]).filter(Boolean);
}

function normalizeTranslations(items) {
  if (Array.isArray(items) === false) {
    return [];
  }

  return items
    .map((item, index) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item.text === "string") {
        return item.text.trim();
      }

      return null;
    })
    .filter((item) => item && item.length > 0);
}

function getUniqueTranslations() {
  return [...new Set(translations)];
}

async function loadGameData() {
  try {
    const response = await fetch("./data.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    translations = normalizeTranslations(data.translations);

    if (translations.length === 0) {
      throw new Error("No translations found");
    }
  } catch (error) {
    translations = [
      "The inscription is too weathered to read.",
    ];
    console.error("Failed to load data.json:", error);
  }
}

function playSound(soundName) {
  const sound = sounds[soundName];

  if (!sound) {
    return;
  }

  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function createSymbol(symbol, className) {
  const element = document.createElement("span");
  element.className = `material-symbols-outlined ${className}`;
  element.textContent = symbol.icon;
  element.setAttribute("aria-hidden", "true");
  return element;
}

function setConnectionStatus(message) {
  if (connectionStatus) {
    connectionStatus.textContent = message;
  }
}

function showGameScreen() {
  lobbyScreen.classList.remove("active");
  setupModal.classList.remove("active");
  setupModal.setAttribute("aria-hidden", "true");
  gameScreen.classList.add("active");
  newRoundButton.classList.toggle("hidden", state.role !== "host");
}

function showSetupModal(role) {
  state.role = role;
  playSound("button");
  setupModal.classList.add("active");
  setupModal.setAttribute("aria-hidden", "false");
  playerNameInput.value = "";
  roomCodeInput.value = "";
  hostButton.classList.toggle("hidden", role !== "host");
  joinButton.classList.toggle("hidden", role !== "player");
  roomCodeField.classList.toggle("hidden", role === "host");
  hostCodeBox.classList.toggle("hidden", role !== "host");
  setConnectionStatus("");

  if (role === "host") {
    state.pendingHostRoomId = makeRoomId();
    hostCodePreview.textContent = state.pendingHostRoomId;
    setupKicker.textContent = "Host setup";
    setupTitle.textContent = "Create the Expedition";
    setupCopy.textContent = "Add your name, then click Create Room before sharing the code with your players.";
    hostButton.disabled = false;
    playerNameInput.focus();
    return;
  }

  setupKicker.textContent = "Player setup";
  setupTitle.textContent = "Join the Expedition";
  setupCopy.textContent = "Add your name and enter the room code shared by the host. The game lasts 10 rounds.";
  joinButton.disabled = false;
  playerNameInput.focus();
}

function hideSetupModal() {
  playSound("button");
  setupModal.classList.remove("active");
  setupModal.setAttribute("aria-hidden", "true");
  state.role = null;
}

function renderTarget() {
  const target = state.target.length > 0 ? state.target : [];

  targetElement.replaceChildren(
    ...target.map((symbol) => {
      const wrapper = document.createElement("div");
      wrapper.className = "target-symbol";

      wrapper.title = symbol.label;
      wrapper.append(createSymbol(symbol, ""));

      return wrapper;
    }),
  );
}

function renderSlots() {
  slotsElement.replaceChildren(
    ...Array.from({ length: 5 }, (_, index) => {
      const slot = document.createElement("div");
      slot.className = "selection-slot";

      if (state.selected[index]) {
        slot.classList.add("has-symbol");
        slot.append(createSymbol(state.selected[index], ""));
      }

      return slot;
    }),
  );
}

function renderBoard() {
  const wall = state.wall.length > 0 ? state.wall : SYMBOLS;

  boardElement.replaceChildren(
    ...wall.map((symbol) => {
      const button = document.createElement("button");
      button.className = "wall-symbol";
      button.type = "button";
      button.dataset.symbolId = symbol.id;
      button.setAttribute("aria-label", symbol.label);
      button.disabled = state.locked;
      button.append(createSymbol(symbol, ""));
      button.addEventListener("click", () => chooseSymbol(symbol, button));
      return button;
    }),
  );

  updateSelectedTiles();
}

function renderScoreboard() {
  const rows = getSortedStandings(state.scoreboard);
  scoreList.replaceChildren(
    ...rows.map((player) => {
      const row = document.createElement("li");
      row.className = "score-row";
      row.classList.toggle("is-self", player.id === state.selfId);
      row.classList.toggle("has-submitted", player.submittedRoundId === state.roundId);

      const dot = document.createElement("span");
      dot.className = "submission-dot";
      dot.setAttribute(
        "aria-label",
        player.submittedRoundId === state.roundId ? "Deciphered this round" : "Not deciphered yet",
      );

      const name = document.createElement("span");
      name.className = "player-name";
      name.textContent = player.name + (player.connected === false ? " offline" : "");

      const score = document.createElement("span");
      score.className = "player-score";
      score.textContent = player.score;

      row.append(dot, name, score);
      return row;
    }),
  );

}

function renderRoundMeta() {
  roundChip.textContent = state.roundNumber > 0 ? `Round ${state.roundNumber} of ${MAX_ROUNDS}` : "10 Rounds";
}

function getSubmittedCount() {
  if (state.role === "host") {
    return Object.values(state.host.players).filter((player) => player.submittedRoundId === state.roundId).length;
  }

  return state.scoreboard.filter((player) => player.submittedRoundId === state.roundId).length;
}

function renderAll() {
  renderTarget();
  renderSlots();
  renderBoard();
  renderScoreboard();
  renderRoundMeta();
}

function updateSelectedTiles() {
  const selectedIds = new Set(state.selected.map((symbol) => symbol.id));

  boardElement.querySelectorAll(".wall-symbol").forEach((button) => {
    button.classList.toggle("is-selected", selectedIds.has(button.dataset.symbolId));
    button.disabled = state.locked;
  });

  decipherButton.disabled =
    state.locked || state.submitted || state.selected.length !== state.target.length;
}

function resetSelection() {
  state.selected = [];
  renderSlots();
  updateSelectedTiles();
}

function showWrongChoice(button) {
  playSound("wrong");
  state.locked = true;
  button.classList.remove("is-wrong");
  slotsElement.classList.remove("shake");

  requestAnimationFrame(() => {
    button.classList.add("is-wrong");
    slotsElement.classList.add("shake");
  });

  window.setTimeout(() => {
    button.classList.remove("is-wrong");
    slotsElement.classList.remove("shake");
    resetSelection();
    state.locked = state.target.length === 0 || state.submitted;
    updateSelectedTiles();
    button.focus();
  }, 300);
}

function chooseSymbol(symbol, button) {
  if (state.locked || state.submitted || state.selected.length === state.target.length) {
    return;
  }

  const expected = state.target[state.selected.length];

  if (symbol.id !== expected.id) {
    statusElement.textContent = "That mark does not fit. Start the inscription again.";
    showWrongChoice(button);
    return;
  }

  state.selected.push(symbol);
  playSound("select");
  statusElement.textContent =
    state.selected.length === state.target.length
      ? "Inscription matched. Send it."
      : `Good. Find symbol ${state.selected.length + 1} of ${state.target.length}.`;
  renderSlots();
  updateSelectedTiles();
}

function openResultModal(phrase, detail) {
  playSound("button");
  modalPhrase.classList.remove("revealing");
  modalPhrase.textContent = phrase;
  modalDetail.textContent = detail || "Wait for the host to reveal the next inscription.";
  resultModal.classList.add("active");
  resultModal.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    playSound("eerie");
    modalPhrase.classList.add("revealing");
  });
  modalClose.focus();
}

function closeResultModal(withSound = false) {
  if (withSound) {
    playSound("button");
  }

  resultModal.classList.remove("active");
  resultModal.setAttribute("aria-hidden", "true");
}

function getSortedStandings(scoreboard) {
  return [...scoreboard].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function openFinalModal(scoreboard) {
  const standings = getSortedStandings(scoreboard);
  finalResults.replaceChildren(
    ...standings.map((player, index) => {
      const row = document.createElement("li");
      row.className = "final-row";

      const rank = document.createElement("span");
      rank.className = "final-rank";
      rank.textContent = `#${index + 1}`;

      const name = document.createElement("span");
      name.className = "player-name";
      name.textContent = player.name;

      const score = document.createElement("span");
      score.className = "final-score";
      score.textContent = player.score;

      row.append(rank, name, score);
      return row;
    }),
  );

  closeResultModal();
  clearCountdown();
  finalModal.classList.add("active");
  finalModal.setAttribute("aria-hidden", "false");
  homeButton.focus();
}

function closeFinalModal() {
  finalModal.classList.remove("active");
  finalModal.setAttribute("aria-hidden", "true");
}

function clearCountdown() {
  state.countdownTimers.forEach((timerId) => window.clearTimeout(timerId));
  state.countdownTimers = [];
  state.countdownActive = false;
  countdownOverlay.classList.remove("active");
  countdownOverlay.setAttribute("aria-hidden", "true");
  countdownHourglass.classList.remove("flip");
}

function flipHourglass() {
  countdownHourglass.classList.remove("flip");
  void countdownHourglass.offsetWidth;
  countdownHourglass.classList.add("flip");
}

function showCountdown(onComplete) {
  clearCountdown();
  state.countdownActive = true;
  countdownOverlay.classList.add("active");
  countdownOverlay.setAttribute("aria-hidden", "false");
  countdownNumber.textContent = "3";
  flipHourglass();

  [2, 1].forEach((count, index) => {
    const timerId = window.setTimeout(() => {
      countdownNumber.textContent = count;
      flipHourglass();
    }, (index + 1) * 1000);
    state.countdownTimers.push(timerId);
  });

  const finishTimer = window.setTimeout(() => {
    clearCountdown();
    if (typeof onComplete === "function") {
      onComplete();
    }
  }, 3000);
  state.countdownTimers.push(finishTimer);
}

function isCorrectSequence(ids) {
  return ids.join("|") === getSymbolIds(state.target).join("|");
}

function submitCurrentSequence() {
  if (state.gameEnded || state.selected.length !== state.target.length || state.submitted) {
    return;
  }

  playSound("button");
  const symbolIds = getSymbolIds(state.selected);
  state.locked = true;
  state.submitted = true;
  updateSelectedTiles();
  statusElement.textContent = "Symbols sent. Waiting for the next inscription.";

  if (state.role === "host") {
    processSubmission(state.selfId, symbolIds);
    return;
  }

  if (state.hostConnection && state.hostConnection.open) {
    state.hostConnection.send({
      type: "submit-sequence",
      roundId: state.roundId,
      symbolIds,
    });
  }
}

function buildScoreboard() {
  return Object.values(state.host.players).map((player) => ({
    id: player.id,
    name: player.name,
    score: player.score,
    connected: player.connected,
    submittedRoundId: player.submittedRoundId,
  }));
}

function broadcast(message) {
  Object.values(state.host.players).forEach((player) => {
    if (player.id !== state.selfId && player.connection && player.connection.open) {
      player.connection.send(message);
    }
  });
}

function broadcastScoreboard() {
  state.scoreboard = buildScoreboard();
  renderScoreboard();
  renderRoundMeta();
  broadcast({
    type: "scoreboard-update",
    scoreboard: state.scoreboard,
    roundId: state.roundId,
  });
}

function preparePhraseDeck() {
  const uniqueTranslations = getUniqueTranslations();
  state.host.phraseDeck = shuffle(uniqueTranslations).slice(0, MAX_ROUNDS);
}

function pickPhrase(roundNumber) {
  const phrase = state.host.phraseDeck[roundNumber - 1];

  if (phrase) {
    return phrase;
  }

  const fallbackPool = getUniqueTranslations();
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)] || "The inscription is too weathered to read.";
}

function prepareForRoundCountdown(roundNumber, roundId, scoreboard) {
  state.roundNumber = roundNumber;
  state.roundId = roundId;
  state.target = [];
  state.selected = [];
  state.locked = true;
  state.submitted = false;
  state.scoreboard = scoreboard || state.scoreboard;
  closeResultModal();
  statusElement.textContent = "New inscription incoming.";
  renderAll();
}

function activateRound(roundData) {
  state.roundId = roundData.roundId;
  state.roundNumber = roundData.roundNumber;
  state.target = getSymbolsFromIds(roundData.targetIds);
  state.phrase = roundData.phrase;
  state.selected = [];
  state.submitted = false;
  state.locked = false;
  state.scoreboard = roundData.scoreboard || state.scoreboard;

  statusElement.textContent = "Find the inscription symbols from left to right.";
  newRoundButton.textContent =
    state.roundNumber >= MAX_ROUNDS ? "Show Final Results" : "New Inscription";
  newRoundButton.disabled = false;
  closeResultModal();
  renderAll();
}

function startNewRound() {
  if (state.role !== "host" || state.countdownActive || state.gameEnded) {
    return;
  }

  playSound("button");

  if (state.roundNumber >= MAX_ROUNDS) {
    endGame();
    return;
  }

  Object.values(state.host.players).forEach((player) => {
    player.submittedRoundId = null;
  });

  const roundData = {
    type: "round-countdown",
    roundId: `round-${Date.now()}`,
    roundNumber: state.roundNumber + 1,
    targetIds: getSymbolIds(shuffle(SYMBOLS).slice(0, 5)),
    phrase: pickPhrase(state.roundNumber + 1),
    scoreboard: buildScoreboard(),
  };

  newRoundButton.disabled = true;
  prepareForRoundCountdown(roundData.roundNumber, roundData.roundId, roundData.scoreboard);
  broadcast(roundData);

  showCountdown(() => {
    activateRound(roundData);
  });
}

function haveAllConnectedPlayersSubmitted() {
  const connectedPlayers = Object.values(state.host.players).filter((player) => player.connected !== false);

  if (connectedPlayers.length === 0 || state.roundId === null) {
    return false;
  }

  return connectedPlayers.every((player) => player.submittedRoundId === state.roundId);
}

function endGame() {
  if (state.role !== "host" || state.gameEnded) {
    return;
  }

  state.gameEnded = true;
  state.locked = true;
  state.scoreboard = buildScoreboard();
  newRoundButton.disabled = true;
  statusElement.textContent = "The expedition is complete.";
  updateSelectedTiles();
  renderScoreboard();
  openFinalModal(state.scoreboard);

  broadcast({
    type: "game-ended",
    scoreboard: state.scoreboard,
  });
}

function processSubmission(playerId, submittedIds) {
  const player = state.host.players[playerId];

  if (!player || player.submittedRoundId === state.roundId) {
    return;
  }

  if (Array.isArray(submittedIds) === false || submittedIds.length !== state.target.length || isCorrectSequence(submittedIds) === false) {
    if (player.connection && player.connection.open) {
      player.connection.send({
        type: "submission-rejected",
        message: "The host could not validate that inscription. Try the sequence again.",
      });
    }
    return;
  }

  const finishPosition = getSubmittedCount() + 1;
  const points = SCORE_BY_FINISH[finishPosition - 1] || 5;
  player.score += points;
  player.submittedRoundId = state.roundId;

  const resultMessage = {
    type: "submission-accepted",
    roundId: state.roundId,
    phrase: state.phrase,
    points,
    position: finishPosition,
    scoreboard: buildScoreboard(),
  };

  if (playerId === state.selfId) {
    state.scoreboard = resultMessage.scoreboard;
    openResultModal(state.phrase, `You were #${finishPosition} and earned ${points} points.`);
  } else if (player.connection && player.connection.open) {
    player.connection.send(resultMessage);
  }

  broadcastScoreboard();

  if (state.roundNumber >= MAX_ROUNDS && haveAllConnectedPlayersSubmitted()) {
    window.setTimeout(endGame, 800);
  }
}

function createHostPlayer() {
  state.host.players[state.selfId] = {
    id: state.selfId,
    name: state.selfName,
    score: 0,
    connected: true,
    connection: null,
    wallIds: getSymbolIds(state.wall),
    submittedRoundId: null,
  };
  state.scoreboard = buildScoreboard();
}

function createHostPeer(roomId) {
  state.peer = new Peer(roomId);

  state.peer.on("open", (openedId) => {
    state.selfId = openedId;
    state.roomId = openedId;
    state.wall = shuffle(SYMBOLS);
    preparePhraseDeck();
    createHostPlayer();
    showGameScreen();
    setConnectionStatus(`Hosting room ${openedId}`);
    statusElement.textContent = "Share the room code, then start a new inscription.";
    renderAll();
  });

  state.peer.on("connection", (connection) => {
    connection.on("data", (message) => receiveAsHost(connection, message));
    connection.on("close", () => markPlayerDisconnected(connection.peer));
  });

  state.peer.on("error", (error) => {
    if (error.type === "unavailable-id") {
      createHostPeer(makeRoomId());
      return;
    }

    setConnectionStatus(`PeerJS error: ${error.type}`);
  });
}

function receiveAsHost(connection, message) {
  if (!message || typeof message.type !== "string") {
    return;
  }

  if (message.type === "join-request") {
    addPlayer(connection, message.name);
  }

  if (message.type === "submit-sequence") {
    processSubmission(connection.peer, message.symbolIds);
  }
}

function addPlayer(connection, requestedName) {
  const nameCheck = validatePlayerName(requestedName);

  if (nameCheck.valid === false) {
    connection.send({
      type: "join-rejected",
      message: "The host saw that name and quietly slid it into the cursed bin.",
    });
    setTimeout(() => connection.close(), 120);
    statusElement.textContent = "A suspicious explorer name was refused at the entrance.";
    return;
  }

  const playerName = nameCheck.name;
  const wall = shuffle(SYMBOLS);

  state.host.connections[connection.peer] = connection;
  state.host.players[connection.peer] = {
    id: connection.peer,
    name: playerName,
    score: 0,
    connected: true,
    connection,
    wallIds: getSymbolIds(wall),
    submittedRoundId: null,
  };

  connection.send({
    type: "join-accepted",
    selfId: connection.peer,
    roomId: state.roomId,
    wallIds: getSymbolIds(wall),
    roundId: state.roundId,
    roundNumber: state.roundNumber,
    targetIds: getSymbolIds(state.target),
    phrase: state.phrase,
    scoreboard: buildScoreboard(),
  });

  broadcastScoreboard();
  statusElement.textContent = `${playerName} joined the expedition.`;
}

function markPlayerDisconnected(playerId) {
  const player = state.host.players[playerId];

  if (!player) {
    return;
  }

  player.connected = false;
  broadcastScoreboard();
}

function joinHostRoom(name, roomId) {
  state.peer = new Peer();

  state.peer.on("open", (peerId) => {
    state.selfId = peerId;
    state.hostConnection = state.peer.connect(roomId);

    state.hostConnection.on("open", () => {
      state.hostConnection.send({
        type: "join-request",
        name,
      });
    });

    state.hostConnection.on("data", receiveAsPlayer);
    state.hostConnection.on("close", () => {
      if (state.role === "player" && gameScreen.classList.contains("active") === false) {
        showJoinFailure();
        return;
      }

      statusElement.textContent = "Disconnected from the host.";
      state.locked = true;
      updateSelectedTiles();
    });

    state.hostConnection.on("error", () => showJoinFailure());
  });

  state.peer.on("error", (error) => {
    if (state.role === "player") {
      showJoinFailure();
      return;
    }

    setConnectionStatus(`PeerJS error: ${error.type}`);
  });
}

function showJoinFailure(message = "That room is not active yet. Ask the host to click Create Room, then try again.") {
  setConnectionStatus(message);
  joinButton.disabled = false;
  hostButton.disabled = false;

  if (state.hostConnection) {
    state.hostConnection.close();
    state.hostConnection = null;
  }

  if (state.peer) {
    state.peer.destroy();
    state.peer = null;
  }
}

function receiveAsPlayer(message) {
  if (!message || typeof message.type !== "string") {
    return;
  }

  if (message.type === "join-rejected") {
    showJoinFailure(message.message || "The host rejected that explorer name.");
    return;
  }

  if (message.type === "join-accepted") {
    state.selfId = message.selfId;
    state.roomId = message.roomId;
    state.wall = getSymbolsFromIds(message.wallIds);
    state.roundId = message.roundId;
    state.roundNumber = message.roundNumber || 0;
    state.target = getSymbolsFromIds(message.targetIds || []);
    state.phrase = message.phrase || "";
    state.selected = [];
    state.submitted = false;
    state.locked = state.target.length === 0;
    state.scoreboard = message.scoreboard || [];

    showGameScreen();
    statusElement.textContent =
      state.target.length > 0
        ? "Find the inscription symbols from left to right."
        : "Joined. Waiting for the host to reveal an inscription.";
    renderAll();
  }

  if (message.type === "round-countdown") {
    prepareForRoundCountdown(message.roundNumber, message.roundId, message.scoreboard);
    showCountdown(() => {
      activateRound(message);
    });
  }

  if (message.type === "round-start") {
    clearCountdown();
    activateRound(message);
  }

  if (message.type === "submission-accepted") {
    state.scoreboard = message.scoreboard || state.scoreboard;
    statusElement.textContent = "Symbols sent. Waiting for the next inscription.";
    renderAll();
    openResultModal(
      message.phrase,
      `You were #${message.position} and earned ${message.points} points.`,
    );
  }

  if (message.type === "submission-rejected") {
    state.locked = false;
    state.submitted = false;
    resetSelection();
    statusElement.textContent = message.message;
  }

  if (message.type === "scoreboard-update") {
    state.scoreboard = message.scoreboard || [];
    renderScoreboard();
    renderRoundMeta();
  }

  if (message.type === "game-ended") {
    state.gameEnded = true;
    state.locked = true;
    state.scoreboard = message.scoreboard || state.scoreboard;
    statusElement.textContent = "The expedition is complete.";
    updateSelectedTiles();
    renderScoreboard();
    openFinalModal(state.scoreboard);
  }
}

function startHosting() {
  playSound("button");

  if (typeof Peer === "undefined") {
    setConnectionStatus("PeerJS did not load. Check your internet connection.");
    return;
  }

  const nameCheck = validatePlayerName(playerNameInput.value);

  if (nameCheck.valid === false) {
    setConnectionStatus(nameCheck.message);
    playerNameInput.focus();
    return;
  }

  state.role = "host";
  state.selfName = nameCheck.name;
  hostButton.disabled = true;
  joinButton.disabled = true;
  setConnectionStatus("Creating room...");
  createHostPeer(state.pendingHostRoomId || makeRoomId());
}

function joinGame() {
  playSound("button");

  if (typeof Peer === "undefined") {
    setConnectionStatus("PeerJS did not load. Check your internet connection.");
    return;
  }

  const roomId = roomCodeInput.value.trim().toUpperCase();

  if (roomId.length === 0) {
    setConnectionStatus("Enter the host room code first.");
    return;
  }

  const nameCheck = validatePlayerName(playerNameInput.value);

  if (nameCheck.valid === false) {
    setConnectionStatus(nameCheck.message);
    playerNameInput.focus();
    return;
  }

  state.role = "player";
  state.selfName = nameCheck.name;
  hostButton.disabled = true;
  joinButton.disabled = true;
  setConnectionStatus(`Joining ${roomId}...`);
  joinHostRoom(state.selfName, roomId);
}

async function copyHostCode() {
  playSound("button");
  const roomCode = state.pendingHostRoomId || hostCodePreview.textContent;

  try {
    await navigator.clipboard.writeText(roomCode);
    setConnectionStatus(`Copied room code ${roomCode}.`);
  } catch (error) {
    setConnectionStatus(`Room code: ${roomCode}`);
  }
}

chooseHostButton.addEventListener("click", () => showSetupModal("host"));
chooseJoinButton.addEventListener("click", () => showSetupModal("player"));
hostButton.addEventListener("click", startHosting);
joinButton.addEventListener("click", joinGame);
copyCodeButton.addEventListener("click", copyHostCode);
setupBackButton.addEventListener("click", hideSetupModal);
newRoundButton.addEventListener("click", startNewRound);
decipherButton.addEventListener("click", submitCurrentSequence);
modalClose.addEventListener("click", () => closeResultModal(true));
resultModal.addEventListener("click", (event) => {
  if (event.target === resultModal) {
    closeResultModal(true);
  }
});
homeButton.addEventListener("click", () => {
  playSound("button");
  window.location.reload();
});

async function initializeGame() {
  await loadGameData();
  renderTarget();
  renderSlots();
  renderBoard();
}

initializeGame();
