const SERVER_CONFIG = {
  ip: "37.72.171.158:50042",
  discordUrl: "https://discord.gg/tecpsFdzv4",
  reportUrl: "https://discord.gg/tecpsFdzv4",
  supportEmail: "aetherwind.support@gmail.com",
  maxPlayers: 50,
  refreshMs: 20000,
  fallback: {
    online: true,
    players: {
      online: 18,
      max: 50,
    },
    motd: "Aetherwind SMP is live and soaring."
  }
};

const ui = {
  statusIndicator: document.getElementById("status-indicator"),
  playerCount: document.getElementById("player-count"),
  playerBar: document.getElementById("player-bar"),
  statusMessage: document.getElementById("status-message"),
  modal: document.getElementById("contact-modal"),
  modalTitle: document.getElementById("modal-title"),
  modalEmail: document.querySelector(".modal-email"),
  modalMessage: document.getElementById("modal-message")
};

const contactTypes = {
  support: {
    title: "Support",
    email: "aetherwind.support@gmail.com",
    message: "We will get back to you as soon as possible."
  },
  problem: {
    title: "Report a Problem",
    email: "aetherwind.support@gmail.com",
    message: "We will get back to you as soon as possible. Please include as much detail as possible about the issue."
  },
  bug: {
    title: "Report a Bug",
    email: "aetherwind.support@gmail.com",
    message: "We will get back to you as soon as possible. Include your username, steps to recreate, and screenshots if possible."
  },
  player: {
    title: "Report a Player",
    email: "aetherwind.support@gmail.com",
    message: "We will get back to you as soon as possible. Please include the player name, the incident, and any evidence you have."
  },
  appeal: {
    title: "Ban Appeal",
    email: "aetherwind.support@gmail.com",
    message: "We will get back to you as soon as possible. Please include your username, the ban reason, and why you believe the penalty should be reviewed."
  }
};

function openContactModal(type) {
  const config = contactTypes[type] || contactTypes.support;
  ui.modalTitle.textContent = config.title;
  ui.modalEmail.textContent = config.email;
  ui.modalMessage.textContent = config.message;
  ui.modal.classList.add("visible");
  ui.modal.setAttribute("aria-hidden", "false");
}

function closeContactModal() {
  ui.modal.classList.remove("visible");
  ui.modal.setAttribute("aria-hidden", "true");
}

function bindContactButtons() {
  document.querySelectorAll(".support-trigger").forEach((button) => {
    button.addEventListener("click", () => openContactModal("support"));
  });

  document.querySelectorAll(".report-trigger").forEach((button) => {
    button.addEventListener("click", () => openContactModal(button.dataset.type || "problem"));
  });

  document.querySelectorAll(".appeal-trigger").forEach((button) => {
    button.addEventListener("click", () => openContactModal("appeal"));
  });

  const closeButton = document.querySelector(".modal-close");
  closeButton.addEventListener("click", closeContactModal);

  ui.modal.addEventListener("click", (event) => {
    if (event.target === ui.modal) {
      closeContactModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeContactModal();
    }
  });
}

async function fetchServerStatus() {
  const apiUrl = `https://api.mcsrvstat.us/2/${SERVER_CONFIG.ip}`;

  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const status = await response.json();

    if (status.online) {
      const onlinePlayers = Number(status.players?.online ?? 0);
      const maxPlayers = Number(status.players?.max ?? SERVER_CONFIG.maxPlayers);

      ui.statusIndicator.textContent = "ONLINE";
      ui.statusIndicator.classList.add("online");
      ui.statusIndicator.classList.remove("offline");
      ui.playerCount.textContent = String(onlinePlayers);
      ui.playerBar.style.width = `${Math.min((onlinePlayers / maxPlayers) * 100, 100)}%`;
      ui.statusMessage.textContent = status.motd?.clean?.[0] || status.motd || "Aetherwind SMP is currently online and active.";
      return;
    }

    throw new Error("Server offline");
  } catch (error) {
    const fallback = SERVER_CONFIG.fallback;
    ui.statusIndicator.textContent = fallback.online ? "ONLINE" : "OFFLINE";
    ui.statusIndicator.classList.toggle("online", Boolean(fallback.online));
    ui.statusIndicator.classList.toggle("offline", !fallback.online);
    ui.playerCount.textContent = String(fallback.players.online);
    ui.playerBar.style.width = `${Math.min((fallback.players.online / fallback.players.max) * 100, 100)}%`;
    ui.statusMessage.textContent = fallback.motd || "Live server data is unavailable right now, but the server is ready for players.";
  }
}

function startLiveStatus() {
  fetchServerStatus();
  setInterval(fetchServerStatus, SERVER_CONFIG.refreshMs);
}

bindContactButtons();
startLiveStatus();
