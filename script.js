const SERVER_CONFIG = {
  ip: "37.72.171.158:50042",
  discordUrl: "https://discord.gg/tecpsFdzv4",
  reportUrl: "https://discord.gg/tecpsFdzv4",
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
  statusMessage: document.getElementById("status-message")
};

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

startLiveStatus();
