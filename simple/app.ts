interface Card {
  id: number;
  value: number;
  flipped: boolean;
  matched: boolean;
}

interface PokemonSprite {
  id: number;
  imageUrl: string;
}

class MemoryGameSimple {
  private cards: Card[] = [];
  private flippedCards: number[] = [];
  private score: number = 0;
  private flips: number = 0;
  private bestScore: number = 0;
  private isLocked: boolean = false;
  private totalPairs: number = 8;
  private matchedPairs: number = 0;
  private pokemonSprites: Map<number, string> = new Map();

  private boardEl: HTMLElement;
  private scoreEl: HTMLElement;
  private flipsEl: HTMLElement;
  private bestScoreEl: HTMLElement;
  private winMessageEl: HTMLElement;
  private restartBtn: HTMLElement;

  private matchSound = new Audio("correct.mp3");
  private errorSound = new Audio("error.mp3");

  constructor() {
    this.boardEl = document.getElementById("game-board")!;
    this.scoreEl = document.getElementById("score")!;
    this.flipsEl = document.getElementById("flips")!;
    this.bestScoreEl = document.getElementById("best-score")!;
    this.winMessageEl = document.getElementById("win-message")!;
    this.restartBtn = document.getElementById("restart-btn")!;

    this.bestScore = this.loadBestScore();
    this.bestScoreEl.textContent = String(this.bestScore);

    this.restartBtn.addEventListener("click", () => this.resetGame());

    this.init();
  }

  private async init(): Promise<void> {
    this.cards = this.createCards();
    this.renderBoard();
    await this.fetchPokemonImages();
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

  private async fetchPokemonImages(startId: number = 1): Promise<void> {
    const pokemonIds = Array.from(
      { length: this.totalPairs },
      (_, i) => startId + i,
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
        console.error(`Failed to fetch Pokemon #${id}:`, error);
        // Fallback: use direct URL from PokeAPI sprites
        this.pokemonSprites.set(
          id,
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        );
      }
    });

    await Promise.all(promises);
    this.updateCardImages();
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

  private renderBoard(): void {
    this.boardEl.innerHTML = "";

    this.cards.forEach((card) => {
      const cardEl = document.createElement("div");
      cardEl.classList.add("card", "loading");
      cardEl.setAttribute("data-id", String(card.id));

      cardEl.innerHTML = `
        <div class="card-face card-back">?</div>
        <div class="card-face card-front">
          <img src="" alt="Pokemon" />
        </div>
      `;

      cardEl.addEventListener("click", () => this.flipCard(card.id));
      this.boardEl.appendChild(cardEl);
    });
  }

  private flipCard(cardId: number): void {
    if (this.isLocked) return;

    const card = this.cards.find((c) => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    // Ignore if two cards are already flipped
    if (this.flippedCards.length >= 2) return;

    card.flipped = true;
    this.flippedCards.push(cardId);
    this.flips++;
    this.flipsEl.textContent = String(this.flips);

    const cardEl = this.boardEl.querySelector(`[data-id="${cardId}"]`);
    cardEl?.classList.add("flipped");

    if (this.flippedCards.length === 2) {
      this.isLocked = true;
      this.checkMatch();
    }
  }

  private checkMatch(): void {
    const [firstId, secondId] = this.flippedCards;
    const firstCard = this.cards.find((c) => c.id === firstId)!;
    const secondCard = this.cards.find((c) => c.id === secondId)!;

    if (firstCard.value === secondCard.value) {
      // Match!
      this.playSound(this.matchSound);
      firstCard.matched = true;
      secondCard.matched = true;
      this.score++;
      this.matchedPairs++;
      this.scoreEl.textContent = String(this.score);

      const firstEl = this.boardEl.querySelector(`[data-id="${firstId}"]`);
      const secondEl = this.boardEl.querySelector(`[data-id="${secondId}"]`);
      firstEl?.classList.add("matched");
      secondEl?.classList.add("matched");

      this.flippedCards = [];
      this.isLocked = false;

      if (this.matchedPairs === this.totalPairs) {
        this.gameWon();
      }
    } else {
      // No match
      this.playSound(this.errorSound);
      // Flip back after 1 second
      setTimeout(() => {
        firstCard.flipped = false;
        secondCard.flipped = false;

        const firstEl = this.boardEl.querySelector(`[data-id="${firstId}"]`);
        const secondEl = this.boardEl.querySelector(`[data-id="${secondId}"]`);
        firstEl?.classList.remove("flipped");
        secondEl?.classList.remove("flipped");

        this.flippedCards = [];
        this.isLocked = false;
      }, 1000);
    }
  }

  private playSound(audio: HTMLAudioElement): void {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  private gameWon(): void {
    this.updateBestScore();
    setTimeout(() => {
      this.winMessageEl.classList.remove("hidden");
    }, 600);
  }

  private updateBestScore(): void {
    if (this.bestScore === 0 || this.flips < this.bestScore) {
      this.bestScore = this.flips;
      this.saveBestScore(this.bestScore);
      this.bestScoreEl.textContent = String(this.bestScore);
    }
  }

  private loadBestScore(): number {
    const saved = localStorage.getItem("memoryGameBestScore");
    return saved ? Number(saved) : 0;
  }

  private saveBestScore(score: number): void {
    localStorage.setItem("memoryGameBestScore", String(score));
  }

  private async resetGame(): Promise<void> {
    this.winMessageEl.classList.add("hidden");
    this.score = 0;
    this.flips = 0;
    this.matchedPairs = 0;
    this.flippedCards = [];
    this.isLocked = false;

    this.scoreEl.textContent = "0";
    this.flipsEl.textContent = "0";
    this.bestScoreEl.textContent = String(this.bestScore);

    const randomOffset = Math.floor(Math.random() * 140) + 1;
    this.pokemonSprites.clear();

    this.cards = this.createCards(randomOffset);
    this.renderBoard();
    await this.fetchPokemonImages(randomOffset);
  }
}

// Initialize game when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new MemoryGameSimple();
});
