interface Card {
  id: number;
  value: number;
  flipped: boolean;
  matched: boolean;
}

type Difficulty = "easy" | "medium" | "hard";
type Theme = "pokemon" | "emoji" | "animal" | "fruit" | "vehicle" | "snack" | "sport" | "face" | "nature" | "music";

interface DifficultyConfig {
  cols: number;
  rows: number;
  pairs: number;
  maxCardSize: number;
}

const DIFFICULTY_MAP: Record<Difficulty, DifficultyConfig> = {
  easy: { cols: 4, rows: 4, pairs: 8, maxCardSize: 110 },
  medium: { cols: 6, rows: 6, pairs: 18, maxCardSize: 90 },
  hard: { cols: 8, rows: 8, pairs: 32, maxCardSize: 75 },
};

// All emojis are Unicode ≤ 10.0 (iOS 11.1+) for maximum compatibility
const THEME_POOLS: Record<Exclude<Theme, "pokemon">, string[]> = {
  emoji: [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "😊", "😇", "🙂", "😉", "😍", "😘", "😜", "🤪",
    "😎", "🤩", "🤗", "🤔", "🤫", "🤭", "😱", "😨",
    "😴", "🤑", "😷", "🤯", "🤠", "😈", "👻", "💀",
  ],
  animal: [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
    "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🦄", "🐝",
    "🐛", "🦋", "🐌", "🐞", "🐙", "🦀", "🐡", "🐠",
    "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🦁",
  ],
  fruit: [
    "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓",
    "🍏", "🍈", "🍒", "🍑", "🍍", "🥝", "🥥", "🥑",
    "🍅", "🌽", "🥕", "🍆", "🥦", "🥒", "🍄", "🥜",
    "🌰", "🍠", "🥔", "🌶️", "🥒", "🥗", "🥐", "🥖",
  ],
  vehicle: [
    "🚗", "🚕", "🚌", "🚑", "🚒", "🏎️", "🚓", "🚜",
    "🚂", "🚙", "🚁", "🛸", "🚀", "🛵", "🚲", "⛵",
    "🛩️", "🚢", "🏍️", "🚐", "🚎", "🚛", "🛶", "🚠",
    "🚃", "🚈", "🚇", "🚊", "🚆", "🚋", "🛫", "🛬",
  ],
  snack: [
    "🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🍪", "🎂",
    "🍫", "🍬", "🍭", "🍰", "🥞", "🥨", "🧀", "🌮",
    "🥪", "🥐", "🍡", "🍦", "🍝", "🥤", "🥛", "🍼",
    "🍜", "🍣", "🍱", "🍘", "🍙", "🍚", "🍛", "🍢",
  ],
  sport: [
    "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱",
    "🏓", "🏸", "🥊", "🥋", "🏹", "🏄", "🏇", "⛷️",
    "🏂", "🎳", "🏋️", "🤸", "🤾", "🚴", "🏊", "⛹️",
    "🤺", "🏌️", "🤽", "🎯", "🏒", "🥅", "🎿", "🤼",
  ],
  face: [
    "😀", "😂", "😎", "🤩", "😜", "🤗", "😇", "😱",
    "🤯", "😴", "🤑", "👻", "🤖", "👽", "💀", "🎃",
    "😈", "🤡", "👾", "💩", "🙈", "🙉", "🙊", "😻",
    "👹", "👺", "🤥", "😤", "😭", "😳", "🥶", "🥵",
  ],
  nature: [
    "🌸", "🌺", "🌻", "🌹", "🌈", "⭐", "🌙", "☀️",
    "❄️", "🔥", "💧", "🌊", "🍀", "🌴", "🌵", "🎄",
    "🍁", "🌾", "💐", "🌼", "🌷", "🌱", "🍃", "🍂",
    "🌿", "☘️", "🎋", "🎍", "🌲", "🌳", "🌏", "💫",
  ],
  music: [
    "🎸", "🎹", "🥁", "🎺", "🎷", "🎻", "🎼", "🎧",
    "🎤", "🎵", "🎨", "✏️", "📐", "🎭", "🔊", "📯",
    "🔔", "🎶", "📻", "💿", "🎲", "🎪", "🎠", "🎡",
    "🎢", "🎮", "🕹️", "🎰", "🏆", "🥇", "🥈", "🥉",
  ],
};

class MemoryGame {
  private cards: Card[] = [];
  private flippedCards: number[] = [];
  private score: number = 0;
  private flips: number = 0;
  private bestScore: number = 0;
  private isLocked: boolean = false;
  private totalPairs: number = 8;
  private matchedPairs: number = 0;
  private pokemonSprites: Map<number, string> = new Map();

  // Timer
  private timerInterval: number = 0;
  private elapsedSeconds: number = 0;
  private timerStarted: boolean = false;

  // Settings
  private difficulty: Difficulty = "easy";
  private theme: Theme = "pokemon";
  private themeData: Map<number, string> = new Map();

  // Audio — dual system: HTMLAudioElement (Chrome/Android) + Web Audio API (Safari/iOS)
  private audioCtx: AudioContext | null = null;
  private matchBuffer: AudioBuffer | null = null;
  private errorBuffer: AudioBuffer | null = null;

  private static readonly VERSION = "1.2.1";

  // DOM elements
  private boardEl: HTMLElement;
  private scoreEl: HTMLElement;
  private flipsEl: HTMLElement;
  private bestScoreEl: HTMLElement;
  private winMessageEl: HTMLElement;
  private winDetailsEl: HTMLElement;
  private restartBtn: HTMLElement;
  private timerEl: HTMLElement;
  private themeSelectEl: HTMLSelectElement;

  constructor() {
    this.boardEl = document.getElementById("game-board")!;
    this.scoreEl = document.getElementById("score")!;
    this.flipsEl = document.getElementById("flips")!;
    this.bestScoreEl = document.getElementById("best-score")!;
    this.winMessageEl = document.getElementById("win-message")!;
    this.winDetailsEl = document.getElementById("win-details")!;
    this.restartBtn = document.getElementById("restart-btn")!;
    this.timerEl = document.getElementById("timer")!;
    this.themeSelectEl = document.getElementById("theme-select") as HTMLSelectElement;

    this.bestScore = this.loadBestScore();
    this.bestScoreEl.textContent = String(this.bestScore);

    this.restartBtn.addEventListener("click", () => this.resetGame());
    this.setupSettingsListeners();
    this.initAudio();
    this.showVersion();
    this.init();
  }

  private showVersion(): void {
    const el = document.getElementById("version");
    if (el) el.textContent = `v${MemoryGame.VERSION}`;
  }

  private initAudio(): void {
    // On first user gesture: create AudioContext for Safari/iOS
    // Safari requires AudioContext to be created inside a user gesture
    const unlock = (): void => {
      if (this.audioCtx) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioCtx = new AudioCtx();

      // Fetch + decode audio files into AudioBuffers (callback form for old Safari)
      const load = (url: string, cb: (buf: AudioBuffer) => void): void => {
        fetch(url)
          .then((r) => r.arrayBuffer())
          .then((raw) => { this.audioCtx!.decodeAudioData(raw, cb, () => {}); })
          .catch(() => {});
      };

      load("correct.mp3", (buf) => { this.matchBuffer = buf; });
      load("error.mp3", (buf) => { this.errorBuffer = buf; });

      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
    document.addEventListener("touchstart", unlock);
    document.addEventListener("click", unlock);
  }

  private setupSettingsListeners(): void {
    // Difficulty buttons
    document.querySelectorAll("[data-difficulty]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const newDifficulty = (btn as HTMLElement).dataset.difficulty as Difficulty;
        if (newDifficulty === this.difficulty) return;

        this.setActiveButton("[data-difficulty]", `[data-difficulty="${newDifficulty}"]`);
        this.difficulty = newDifficulty;
        this.resetGame();
      });
    });

    // Theme dropdown
    this.themeSelectEl.addEventListener("change", () => {
      this.theme = this.themeSelectEl.value as Theme;
      this.resetGame();
    });
  }

  private setActiveButton(groupSelector: string, activeSelector: string): void {
    document.querySelectorAll(groupSelector).forEach((b) => b.classList.remove("active"));
    document.querySelector(activeSelector)?.classList.add("active");
  }

  private async init(): Promise<void> {
    this.applyDifficulty();
    this.cards = this.createCards();
    this.renderBoard();
    await this.loadThemeData();
  }

  private applyDifficulty(): void {
    const config = DIFFICULTY_MAP[this.difficulty];
    this.totalPairs = config.pairs;

    this.boardEl.style.setProperty("--cols", String(config.cols));
    this.boardEl.style.setProperty("--max-card", config.maxCardSize + "px");
  }

  private createCards(startId: number = 1): Card[] {
    const cards: Card[] = [];

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

  private shuffle(array: Card[]): Card[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async loadThemeData(): Promise<void> {
    this.themeData.clear();
    this.pokemonSprites.clear();

    if (this.theme === "pokemon") {
      await this.fetchPokemonImages();
    } else {
      this.loadEmojiTheme();
    }
  }

  private loadEmojiTheme(): void {
    if (this.theme === "pokemon") return;
    const pool = THEME_POOLS[this.theme];

    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const startId = this.getStartId();

    for (let i = 0; i < this.totalPairs; i++) {
      const id = startId + i;
      this.themeData.set(id, shuffledPool[i % shuffledPool.length]);
    }

    this.updateCardContent();
  }

  private async fetchPokemonImages(startId?: number): Promise<void> {
    const offset = startId ?? this.getStartId();
    const pokemonIds = Array.from(
      { length: this.totalPairs },
      (_, i) => offset + i,
    );

    const promises = pokemonIds.map(async (id) => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        const imageUrl: string =
          data.sprites.other["official-artwork"].front_default ||
          data.sprites.front_default;
        this.pokemonSprites.set(id, imageUrl);
      } catch (error) {
        console.error(`Lỗi tải Pokemon #${id}:`, error);
        this.pokemonSprites.set(
          id,
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        );
      }
    });

    await Promise.all(promises);
    this.updateCardImages();
  }

  private getStartId(): number {
    if (this.cards.length > 0) {
      return Math.min(...this.cards.map((c) => c.value));
    }
    return 1;
  }

  private updateCardImages(): void {
    const cardElements = this.boardEl.querySelectorAll(".card");
    cardElements.forEach((cardEl) => {
      const cardId = Number(cardEl.getAttribute("data-id"));
      const card = this.cards.find((c) => c.id === cardId);
      if (!card) return;

      const imgEl = cardEl.querySelector(".card-front img") as HTMLImageElement;
      const imageUrl = this.pokemonSprites.get(card.value);
      if (imgEl && imageUrl) {
        imgEl.src = imageUrl;
        imgEl.alt = `Pokemon #${card.value}`;
      }
      cardEl.classList.remove("loading");
    });
  }

  private updateCardContent(): void {
    const cardElements = this.boardEl.querySelectorAll(".card");
    cardElements.forEach((cardEl) => {
      const cardId = Number(cardEl.getAttribute("data-id"));
      const card = this.cards.find((c) => c.id === cardId);
      if (!card) return;

      const frontEl = cardEl.querySelector(".card-front") as HTMLElement;
      const emoji = this.themeData.get(card.value);
      if (frontEl && emoji) {
        frontEl.innerHTML = `<span class="card-emoji">${emoji}</span>`;
      }
      cardEl.classList.remove("loading");
    });
  }

  private renderBoard(): void {
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
      } else {
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

  private flipCard(cardId: number): void {
    if (this.isLocked) return;

    const card = this.cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    if (this.flippedCards.length >= 2) return;

    if (!this.timerStarted) {
      this.startTimer();
    }

    card.flipped = true;
    this.flippedCards.push(cardId);
    this.flips++;
    this.flipsEl.textContent = String(this.flips);

    const cardEl = this.boardEl.querySelector(`[data-id="${cardId}"]`);
    cardEl?.classList.add("flipped");

    if (this.flippedCards.length === 2) {
      this.isLocked = true;
      // Play sound immediately inside click handler (user gesture context)
      // so Safari/Chrome don't block audio playback.
      // Visual effects are delayed until the flip transition finishes.
      const firstCard = this.cards.find((c) => c.id === this.flippedCards[0])!;
      const secondCard = this.cards.find((c) => c.id === this.flippedCards[1])!;
      const isMatch = firstCard.value === secondCard.value;
      this.playSound(isMatch ? "match" : "error");

      if (cardEl) {
        cardEl.addEventListener("transitionend", () => {
          this.checkMatch();
        }, { once: true });
      } else {
        this.checkMatch();
      }
    }
  }

  private checkMatch(): void {
    const [firstId, secondId] = this.flippedCards;
    const firstCard = this.cards.find((c) => c.id === firstId)!;
    const secondCard = this.cards.find((c) => c.id === secondId)!;

    if (firstCard.value === secondCard.value) {
      firstCard.matched = true;
      secondCard.matched = true;
      this.matchedPairs++;

      this.score = this.calculateScore();
      this.scoreEl.textContent = String(this.score);

      const firstEl = this.boardEl.querySelector(`[data-id="${firstId}"]`) as HTMLElement | null;
      const secondEl = this.boardEl.querySelector(`[data-id="${secondId}"]`) as HTMLElement | null;
      firstEl?.classList.add("matched");
      secondEl?.classList.add("matched");
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
    } else {
      const firstEl = this.boardEl.querySelector(`[data-id="${firstId}"]`) as HTMLElement | null;
      const secondEl = this.boardEl.querySelector(`[data-id="${secondId}"]`) as HTMLElement | null;

      // Apply shake animation inline (avoids CSS animation conflicts on iOS)
      if (firstEl) firstEl.style.animation = "cardShake 0.4s ease";
      if (secondEl) secondEl.style.animation = "cardShake 0.4s ease";

      // After delay: clear animation, then flip back
      setTimeout(() => {
        if (firstEl) firstEl.style.animation = "none";
        if (secondEl) secondEl.style.animation = "none";

        firstCard.flipped = false;
        secondCard.flipped = false;
        firstEl?.classList.remove("flipped");
        secondEl?.classList.remove("flipped");

        this.flippedCards = [];
        this.isLocked = false;
      }, 1000);
    }
  }

  private calculateScore(): number {
    const timePenalty = Math.floor(this.elapsedSeconds / 5) * 5;
    const flipPenalty = Math.max(0, this.flips - this.matchedPairs * 2) * 10;
    const basePoints = this.matchedPairs * 100;
    return Math.max(0, basePoints - timePenalty - flipPenalty);
  }

  private startTimer(): void {
    this.timerStarted = true;
    this.elapsedSeconds = 0;
    this.timerInterval = window.setInterval(() => {
      this.elapsedSeconds++;
      this.timerEl.textContent = this.formatTime(this.elapsedSeconds);
    }, 1000);
  }

  private stopTimer(): void {
    clearInterval(this.timerInterval);
    this.timerStarted = false;
  }

  private formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  private playSound(type: "match" | "error"): void {
    const buffer = type === "match" ? this.matchBuffer : this.errorBuffer;

    // Try Web Audio API first (works on Safari/iOS after unlock)
    if (this.audioCtx && buffer) {
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      source.start(0);
      return;
    }

    // Fallback: HTMLAudioElement (works on Chrome/Android)
    const url = type === "match" ? "correct.mp3" : "error.mp3";
    const audio = new Audio(url);
    audio.play().catch(() => {});
  }

  private gameWon(): void {
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

  private updateBestScore(): void {
    const key = this.getBestScoreKey();
    const currentBest = this.loadBestScore();
    if (currentBest === 0 || this.score > currentBest) {
      this.bestScore = this.score;
      localStorage.setItem(key, String(this.score));
      this.bestScoreEl.textContent = String(this.bestScore);
    }
  }

  private getBestScoreKey(): string {
    return `memoryGame_best_${this.difficulty}_${this.theme}`;
  }

  private loadBestScore(): number {
    const saved = localStorage.getItem(this.getBestScoreKey());
    return saved ? Number(saved) : 0;
  }

  private async resetGame(): Promise<void> {
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
    await this.loadThemeData();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MemoryGame();
});
