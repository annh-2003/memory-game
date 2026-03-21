"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DIFFICULTY_MAP = {
    easy: { cols: 4, rows: 4, pairs: 8, maxCardSize: 110 },
    medium: { cols: 6, rows: 6, pairs: 18, maxCardSize: 90 },
    hard: { cols: 8, rows: 8, pairs: 32, maxCardSize: 75 },
};
// All emojis are Unicode ≤ 11.0 (iOS 12.1+) for maximum compatibility
const THEME_POOLS = {
    emoji: [
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
        "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦄", "🐝",
        "🐛", "🦋", "🐌", "🐞", "🐙", "🦀", "🐡", "🐠",
        "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🦁",
    ],
    animal: [
        "🐕", "🐈", "🐎", "🐄", "🐖", "🐑", "🐐", "🦌",
        "🐘", "🦏", "🦛", "🐪", "🦒", "🦘", "🐺", "🐃",
        "🐫", "🦧", "🐆", "🐅", "🦡", "🐨", "🦙", "🐇",
        "🐿️", "🦔", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩",
    ],
    fruit: [
        "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓",
        "🍏", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝",
        "🍅", "🥑", "🌽", "🥕", "🍆", "🥦", "🥒", "🌶️",
        "🥬", "🍄", "🥜", "🌰", "🍠", "🥔", "🧄", "🧅",
    ],
    vehicle: [
        "🚗", "🚕", "🚌", "🚑", "🚒", "🏎️", "🚓", "🚜",
        "🚂", "🚙", "🚁", "🛸", "🚀", "🛵", "🚲", "⛵",
        "🛩️", "🚢", "🏍️", "🚐", "🚎", "🚑", "🛶", "🚠",
        "🚃", "🚈", "🚇", "🚊", "🚆", "🚋", "🛫", "🛬",
    ],
    snack: [
        "🍕", "🍔", "🍟", "🌭", "🍿", "🧁", "🍩", "🍪",
        "🎂", "🍫", "🍬", "🍭", "🍰", "🥞", "🥨", "🥯",
        "🧀", "🌮", "🥪", "🥐", "🍡", "🍦", "🍝", "🥧",
        "🥤", "🥛", "🍼", "🍜", "🍣", "🍱", "🥙", "🍘",
    ],
    sport: [
        "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱",
        "🏓", "🏸", "🥊", "🥋", "🏹", "🏄", "🏇", "⛷️",
        "🏂", "🎳", "🏋️", "🤸", "🤾", "🚴", "🧗", "🏊",
        "⛹️", "🤺", "🏌️", "🤽", "🎯", "🛹", "🏒", "🥅",
    ],
    face: [
        "😀", "😂", "🥰", "😎", "🤩", "😜", "🤗", "😇",
        "🥳", "😱", "🤯", "😴", "🤑", "👻", "🤖", "👽",
        "💀", "🎃", "😈", "🦸", "🧚", "🧜", "🧛", "🧞",
        "🧙", "🤡", "👾", "💩", "🙈", "🙉", "🙊", "😻",
    ],
    nature: [
        "🌸", "🌺", "🌻", "🌹", "🌈", "⭐", "🌙", "☀️",
        "❄️", "🔥", "💧", "🌊", "🍀", "🌴", "🌵", "🎄",
        "🍁", "🌾", "💐", "🌼", "🏵️", "🌷", "🥀", "🌱",
        "🍃", "🍂", "🌿", "☘️", "🎑", "🎋", "🎍", "🌲",
    ],
    music: [
        "🎸", "🎹", "🥁", "🎺", "🎷", "🎻", "🎼", "🎧",
        "🎤", "🎵", "🎨", "🖌️", "🖍️", "✏️", "📐", "🎭",
        "🔊", "📯", "🔔", "🎶", "🎙️", "📻", "💿", "🎚️",
        "🥏", "🎲", "🎪", "🎠", "🎡", "🎢", "🎮", "🕹️",
    ],
};
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.score = 0;
        this.flips = 0;
        this.bestScore = 0;
        this.isLocked = false;
        this.totalPairs = 8;
        this.matchedPairs = 0;
        this.pokemonSprites = new Map();
        // Timer
        this.timerInterval = 0;
        this.elapsedSeconds = 0;
        this.timerStarted = false;
        // Settings
        this.difficulty = "easy";
        this.theme = "pokemon";
        this.themeData = new Map();
        // Audio — pool of pre-unlocked elements for iOS compatibility
        this.matchPool = [];
        this.errorPool = [];
        this.matchPoolIndex = 0;
        this.errorPoolIndex = 0;
        this.boardEl = document.getElementById("game-board");
        this.scoreEl = document.getElementById("score");
        this.flipsEl = document.getElementById("flips");
        this.bestScoreEl = document.getElementById("best-score");
        this.winMessageEl = document.getElementById("win-message");
        this.winDetailsEl = document.getElementById("win-details");
        this.restartBtn = document.getElementById("restart-btn");
        this.timerEl = document.getElementById("timer");
        this.themeSelectEl = document.getElementById("theme-select");
        this.bestScore = this.loadBestScore();
        this.bestScoreEl.textContent = String(this.bestScore);
        this.restartBtn.addEventListener("click", () => this.resetGame());
        this.setupSettingsListeners();
        this.initAudio();
        this.showVersion();
        this.init();
    }
    showVersion() {
        const el = document.getElementById("version");
        if (el)
            el.textContent = `v${MemoryGame.VERSION}`;
    }
    initAudio() {
        // Create a pool of Audio elements for each sound.
        // iOS only allows each HTMLAudioElement to play once reliably,
        // so we rotate through a pool of pre-created elements.
        const createPool = (url) => {
            const pool = [];
            for (let i = 0; i < MemoryGame.AUDIO_POOL_SIZE; i++) {
                const audio = new Audio(url);
                audio.load();
                pool.push(audio);
            }
            return pool;
        };
        this.matchPool = createPool("correct.mp3");
        this.errorPool = createPool("error.mp3");
        // iOS requires a user gesture to "unlock" audio playback.
        // On first touch: do a muted play+pause on all pool elements.
        const unlock = () => {
            [...this.matchPool, ...this.errorPool].forEach((audio) => {
                audio.muted = true;
                audio.play().then(() => {
                    audio.pause();
                    audio.muted = false;
                    audio.currentTime = 0;
                }).catch(() => {
                    audio.muted = false;
                });
            });
            document.removeEventListener("touchstart", unlock);
            document.removeEventListener("click", unlock);
        };
        document.addEventListener("touchstart", unlock);
        document.addEventListener("click", unlock);
    }
    setupSettingsListeners() {
        // Difficulty buttons
        document.querySelectorAll("[data-difficulty]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const newDifficulty = btn.dataset.difficulty;
                if (newDifficulty === this.difficulty)
                    return;
                this.setActiveButton("[data-difficulty]", `[data-difficulty="${newDifficulty}"]`);
                this.difficulty = newDifficulty;
                this.resetGame();
            });
        });
        // Theme dropdown
        this.themeSelectEl.addEventListener("change", () => {
            this.theme = this.themeSelectEl.value;
            this.resetGame();
        });
    }
    setActiveButton(groupSelector, activeSelector) {
        var _a;
        document.querySelectorAll(groupSelector).forEach((b) => b.classList.remove("active"));
        (_a = document.querySelector(activeSelector)) === null || _a === void 0 ? void 0 : _a.classList.add("active");
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.applyDifficulty();
            this.cards = this.createCards();
            this.renderBoard();
            yield this.loadThemeData();
        });
    }
    applyDifficulty() {
        const config = DIFFICULTY_MAP[this.difficulty];
        this.totalPairs = config.pairs;
        this.boardEl.style.setProperty("--cols", String(config.cols));
        this.boardEl.style.setProperty("--max-card", config.maxCardSize + "px");
    }
    createCards(startId = 1) {
        const cards = [];
        for (let i = 0; i < this.totalPairs; i++) {
            const pokemonId = startId + i;
            cards.push({
                id: i * 2,
                value: pokemonId,
                flipped: false,
                matched: false,
            });
            cards.push({
                id: i * 2 + 1,
                value: pokemonId,
                flipped: false,
                matched: false,
            });
        }
        return this.shuffle(cards);
    }
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    loadThemeData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.themeData.clear();
            this.pokemonSprites.clear();
            if (this.theme === "pokemon") {
                yield this.fetchPokemonImages();
            }
            else {
                this.loadEmojiTheme();
            }
        });
    }
    loadEmojiTheme() {
        if (this.theme === "pokemon")
            return;
        const pool = THEME_POOLS[this.theme];
        const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
        const startId = this.getStartId();
        for (let i = 0; i < this.totalPairs; i++) {
            const id = startId + i;
            this.themeData.set(id, shuffledPool[i % shuffledPool.length]);
        }
        this.updateCardContent();
    }
    fetchPokemonImages(startId) {
        return __awaiter(this, void 0, void 0, function* () {
            const offset = startId !== null && startId !== void 0 ? startId : this.getStartId();
            const pokemonIds = Array.from({ length: this.totalPairs }, (_, i) => offset + i);
            const promises = pokemonIds.map((id) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                    const data = yield response.json();
                    const imageUrl = data.sprites.other["official-artwork"].front_default ||
                        data.sprites.front_default;
                    this.pokemonSprites.set(id, imageUrl);
                }
                catch (error) {
                    console.error(`Lỗi tải Pokemon #${id}:`, error);
                    this.pokemonSprites.set(id, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
                }
            }));
            yield Promise.all(promises);
            this.updateCardImages();
        });
    }
    getStartId() {
        if (this.cards.length > 0) {
            return Math.min(...this.cards.map((c) => c.value));
        }
        return 1;
    }
    updateCardImages() {
        const cardElements = this.boardEl.querySelectorAll(".card");
        cardElements.forEach((cardEl) => {
            const cardId = Number(cardEl.getAttribute("data-id"));
            const card = this.cards.find((c) => c.id === cardId);
            if (!card)
                return;
            const imgEl = cardEl.querySelector(".card-front img");
            const imageUrl = this.pokemonSprites.get(card.value);
            if (imgEl && imageUrl) {
                imgEl.src = imageUrl;
                imgEl.alt = `Pokemon #${card.value}`;
            }
            cardEl.classList.remove("loading");
        });
    }
    updateCardContent() {
        const cardElements = this.boardEl.querySelectorAll(".card");
        cardElements.forEach((cardEl) => {
            const cardId = Number(cardEl.getAttribute("data-id"));
            const card = this.cards.find((c) => c.id === cardId);
            if (!card)
                return;
            const frontEl = cardEl.querySelector(".card-front");
            const emoji = this.themeData.get(card.value);
            if (frontEl && emoji) {
                frontEl.innerHTML = `<span class="card-emoji">${emoji}</span>`;
            }
            cardEl.classList.remove("loading");
        });
    }
    renderBoard() {
        this.boardEl.innerHTML = "";
        this.cards.forEach((card, index) => {
            const cardEl = document.createElement("div");
            cardEl.classList.add("card", "loading");
            cardEl.setAttribute("data-id", String(card.id));
            cardEl.style.animationDelay = `${index * 20}ms`;
            if (this.theme === "pokemon") {
                cardEl.innerHTML = `
          <div class="card-face card-back">?</div>
          <div class="card-face card-front">
            <img src="" alt="Pokemon" />
          </div>
        `;
            }
            else {
                cardEl.innerHTML = `
          <div class="card-face card-back">?</div>
          <div class="card-face card-front">
            <span class="card-emoji"></span>
          </div>
        `;
            }
            // Clear animation after it completes to prevent conflicts with flip/shake
            cardEl.addEventListener("animationend", () => {
                cardEl.style.animation = "none";
            }, { once: true });
            cardEl.addEventListener("click", () => this.flipCard(card.id));
            this.boardEl.appendChild(cardEl);
        });
    }
    flipCard(cardId) {
        if (this.isLocked)
            return;
        const card = this.cards.find((c) => c.id === cardId);
        if (!card || card.flipped || card.matched)
            return;
        if (this.flippedCards.length >= 2)
            return;
        if (!this.timerStarted) {
            this.startTimer();
        }
        card.flipped = true;
        this.flippedCards.push(cardId);
        this.flips++;
        this.flipsEl.textContent = String(this.flips);
        const cardEl = this.boardEl.querySelector(`[data-id="${cardId}"]`);
        cardEl === null || cardEl === void 0 ? void 0 : cardEl.classList.add("flipped");
        if (this.flippedCards.length === 2) {
            this.isLocked = true;
            // Wait for the 2nd card's flip transition to finish before checking
            if (cardEl) {
                cardEl.addEventListener("transitionend", () => {
                    this.checkMatch();
                }, { once: true });
            }
            else {
                this.checkMatch();
            }
        }
    }
    checkMatch() {
        const [firstId, secondId] = this.flippedCards;
        const firstCard = this.cards.find((c) => c.id === firstId);
        const secondCard = this.cards.find((c) => c.id === secondId);
        if (firstCard.value === secondCard.value) {
            this.playSoundFromPool(this.matchPool, "matchPoolIndex");
            firstCard.matched = true;
            secondCard.matched = true;
            this.matchedPairs++;
            this.score = this.calculateScore();
            this.scoreEl.textContent = String(this.score);
            const firstEl = this.boardEl.querySelector(`[data-id="${firstId}"]`);
            const secondEl = this.boardEl.querySelector(`[data-id="${secondId}"]`);
            firstEl === null || firstEl === void 0 ? void 0 : firstEl.classList.add("matched");
            secondEl === null || secondEl === void 0 ? void 0 : secondEl.classList.add("matched");
            if (firstEl) {
                firstEl.style.animation = "matchBounce 0.5s ease";
                firstEl.addEventListener("animationend", () => {
                    firstEl.style.animation = "none";
                }, { once: true });
            }
            if (secondEl) {
                secondEl.style.animation = "matchBounce 0.5s ease";
                secondEl.addEventListener("animationend", () => {
                    secondEl.style.animation = "none";
                }, { once: true });
            }
            this.flippedCards = [];
            this.isLocked = false;
            if (this.matchedPairs === this.totalPairs) {
                this.gameWon();
            }
        }
        else {
            this.playSoundFromPool(this.errorPool, "errorPoolIndex");
            const firstEl = this.boardEl.querySelector(`[data-id="${firstId}"]`);
            const secondEl = this.boardEl.querySelector(`[data-id="${secondId}"]`);
            // Apply shake animation inline (avoids CSS animation conflicts on iOS)
            if (firstEl)
                firstEl.style.animation = "cardShake 0.4s ease";
            if (secondEl)
                secondEl.style.animation = "cardShake 0.4s ease";
            // After delay: clear animation, then flip back
            setTimeout(() => {
                if (firstEl)
                    firstEl.style.animation = "none";
                if (secondEl)
                    secondEl.style.animation = "none";
                firstCard.flipped = false;
                secondCard.flipped = false;
                firstEl === null || firstEl === void 0 ? void 0 : firstEl.classList.remove("flipped");
                secondEl === null || secondEl === void 0 ? void 0 : secondEl.classList.remove("flipped");
                this.flippedCards = [];
                this.isLocked = false;
            }, 1000);
        }
    }
    calculateScore() {
        const timePenalty = Math.floor(this.elapsedSeconds / 5) * 5;
        const flipPenalty = Math.max(0, this.flips - this.matchedPairs * 2) * 10;
        const basePoints = this.matchedPairs * 100;
        return Math.max(0, basePoints - timePenalty - flipPenalty);
    }
    startTimer() {
        this.timerStarted = true;
        this.elapsedSeconds = 0;
        this.timerInterval = window.setInterval(() => {
            this.elapsedSeconds++;
            this.timerEl.textContent = this.formatTime(this.elapsedSeconds);
        }, 1000);
    }
    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerStarted = false;
    }
    formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    playSoundFromPool(pool, indexProp) {
        const audio = pool[this[indexProp]];
        this[indexProp] = (this[indexProp] + 1) % pool.length;
        audio.currentTime = 0;
        audio.play().catch(() => { });
    }
    gameWon() {
        this.stopTimer();
        this.score = this.calculateScore();
        this.scoreEl.textContent = String(this.score);
        this.updateBestScore();
        const timeStr = this.formatTime(this.elapsedSeconds);
        this.winDetailsEl.innerHTML =
            `Số cặp: ${this.totalPairs} | Lượt lật: ${this.flips} | Thời gian: ${timeStr}<br>` +
                `Điểm cuối: ${this.score}`;
        setTimeout(() => {
            this.winMessageEl.classList.remove("hidden");
        }, 600);
    }
    updateBestScore() {
        const key = this.getBestScoreKey();
        const currentBest = this.loadBestScore();
        if (currentBest === 0 || this.score > currentBest) {
            this.bestScore = this.score;
            localStorage.setItem(key, String(this.score));
            this.bestScoreEl.textContent = String(this.bestScore);
        }
    }
    getBestScoreKey() {
        return `memoryGame_best_${this.difficulty}_${this.theme}`;
    }
    loadBestScore() {
        const saved = localStorage.getItem(this.getBestScoreKey());
        return saved ? Number(saved) : 0;
    }
    resetGame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.winMessageEl.classList.add("hidden");
            this.score = 0;
            this.flips = 0;
            this.matchedPairs = 0;
            this.flippedCards = [];
            this.isLocked = false;
            this.stopTimer();
            this.elapsedSeconds = 0;
            this.scoreEl.textContent = "0";
            this.flipsEl.textContent = "0";
            this.timerEl.textContent = "0:00";
            this.bestScore = this.loadBestScore();
            this.bestScoreEl.textContent = String(this.bestScore);
            this.applyDifficulty();
            const randomOffset = Math.floor(Math.random() * 140) + 1;
            this.pokemonSprites.clear();
            this.themeData.clear();
            this.cards = this.createCards(randomOffset);
            this.renderBoard();
            yield this.loadThemeData();
        });
    }
}
MemoryGame.AUDIO_POOL_SIZE = 4;
MemoryGame.VERSION = "1.2.0";
document.addEventListener("DOMContentLoaded", () => {
    new MemoryGame();
});
