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
  modalMessage: document.getElementById("modal-message"),
  averageRating: document.getElementById("average-rating"),
  averageStars: document.getElementById("average-stars"),
  reviewCount: document.getElementById("review-count"),
  reviewList: document.getElementById("review-list"),
  reviewName: document.getElementById("review-name"),
  reviewText: document.getElementById("review-text"),
  reviewSubmit: document.querySelector(".review-submit"),
  reviewStatus: document.getElementById("review-status")
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

const seedReviews = [
  { name: "SkyRift", rating: 5, text: "The community is super active and the builds are incredible. Every event feels organized and fun." },
  { name: "LunaBlock", rating: 5, text: "Aetherwind feels like a proper survival server with a strong vibe, fair staff, and memorable moments." },
  { name: "DreadPine", rating: 4, text: "Great server, solid players, and a really welcoming Discord. The world feels alive and creative." }
];

let selectedStar = 5;
let reviews = [...seedReviews];
const REVIEW_STORAGE_KEY = 'aetherwind_review_submitted';

function getHasReviewed() {
  try {
    return localStorage.getItem(REVIEW_STORAGE_KEY) === 'true';
  } catch (error) {
    return false;
  }
}

function setHasReviewed(value) {
  try {
    localStorage.setItem(REVIEW_STORAGE_KEY, String(value));
  } catch (error) {
    // Ignore storage failures in private or restricted browsers.
  }
}

function renderStars(rating) {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

function renderReviewList() {
  if (!ui.reviewList) return;

  ui.reviewList.innerHTML = reviews.map((review) => `
    <article class="review-item reveal">
      <div class="review-header">
        <p class="review-author">${review.name}</p>
        <span class="review-stars" aria-label="${review.rating} out of 5 stars">${renderStars(review.rating)}</span>
      </div>
      <p class="review-text">${review.text}</p>
    </article>
  `).join('');

  const revealItems = document.querySelectorAll('.review-item.reveal');
  revealItems.forEach((item) => item.classList.add('visible'));
}

function updateRatingSummary() {
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = total / reviews.length;
  const roundedAverage = average.toFixed(1);

  ui.averageRating.textContent = roundedAverage;
  ui.averageStars.textContent = renderStars(average);
  ui.reviewCount.textContent = String(reviews.length);
}

function setSelectedStars(value) {
  selectedStar = value;
  const stars = document.querySelectorAll('.star-btn');
  stars.forEach((star) => {
    star.classList.toggle('active', Number(star.dataset.value) <= value);
  });
}

function submitReview() {
  if (getHasReviewed()) {
    if (ui.reviewStatus) {
      ui.reviewStatus.textContent = 'You have already left a review on this device.';
    }
    return;
  }

  const name = ui.reviewName.value.trim() || 'Anonymous';
  const text = ui.reviewText.value.trim();

  if (!text) {
    ui.reviewText.focus();
    return;
  }

  reviews.unshift({ name, rating: selectedStar, text });
  setHasReviewed(true);
  ui.reviewName.value = '';
  ui.reviewText.value = '';
  setSelectedStars(5);
  updateRatingSummary();
  renderReviewList();

  if (ui.reviewStatus) {
    ui.reviewStatus.textContent = 'Thanks for the review! You can only leave one review per device.';
  }

  if (ui.reviewSubmit) {
    ui.reviewSubmit.disabled = true;
  }

  ['review-name', 'review-text'].forEach((id) => {
    const field = document.getElementById(id);
    if (field) field.disabled = true;
  });
}

function initReviews() {
  const starButtons = document.querySelectorAll('.star-btn');
  starButtons.forEach((button) => {
    button.addEventListener('click', () => setSelectedStars(Number(button.dataset.value)));
  });

  if (getHasReviewed()) {
    if (ui.reviewSubmit) {
      ui.reviewSubmit.disabled = true;
    }

    ['review-name', 'review-text'].forEach((id) => {
      const field = document.getElementById(id);
      if (field) field.disabled = true;
    });

    if (ui.reviewStatus) {
      ui.reviewStatus.textContent = 'You have already left a review on this device.';
    }
  }

  if (ui.reviewSubmit) {
    ui.reviewSubmit.addEventListener('click', submitReview);
  }

  updateRatingSummary();
  renderReviewList();
}

function startLiveStatus() {
  fetchServerStatus();
  setInterval(fetchServerStatus, SERVER_CONFIG.refreshMs);
}

function initRevealAnimations() {
  const revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -30px 0px'
  });

  revealItems.forEach((item) => observer.observe(item));
}

bindContactButtons();
initRevealAnimations();
initReviews();
startLiveStatus();
