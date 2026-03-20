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
        this.matchSound = new Audio("correct.mp3");
        this.errorSound = new Audio("error.mp3");
        this.boardEl = document.getElementById("game-board");
        this.scoreEl = document.getElementById("score");
        this.flipsEl = document.getElementById("flips");
        this.bestScoreEl = document.getElementById("best-score");
        this.winMessageEl = document.getElementById("win-message");
        this.restartBtn = document.getElementById("restart-btn");
        this.bestScore = this.loadBestScore();
        this.bestScoreEl.textContent = String(this.bestScore);
        this.restartBtn.addEventListener("click", () => this.resetGame());
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cards = this.createCards();
            this.renderBoard();
            yield this.fetchPokemonImages();
        });
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
    fetchPokemonImages() {
        return __awaiter(this, arguments, void 0, function* (startId = 1) {
            const pokemonIds = Array.from({ length: this.totalPairs }, (_, i) => startId + i);
            const promises = pokemonIds.map((id) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const response = yield fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                    const data = yield response.json();
                    const imageUrl = data.sprites.other["official-artwork"].front_default ||
                        data.sprites.front_default;
                    this.pokemonSprites.set(id, imageUrl);
                }
                catch (error) {
                    console.error(`Failed to fetch Pokemon #${id}:`, error);
                    // Fallback: use direct URL from PokeAPI sprites
                    this.pokemonSprites.set(id, `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`);
                }
            }));
            yield Promise.all(promises);
            this.updateCardImages();
        });
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
    renderBoard() {
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
    flipCard(cardId) {
        if (this.isLocked)
            return;
        const card = this.cards.find((c) => c.id === cardId);
        if (!card || card.flipped || card.matched)
            return;
        // Ignore if two cards are already flipped
        if (this.flippedCards.length >= 2)
            return;
        card.flipped = true;
        this.flippedCards.push(cardId);
        this.flips++;
        this.flipsEl.textContent = String(this.flips);
        const cardEl = this.boardEl.querySelector(`[data-id="${cardId}"]`);
        cardEl === null || cardEl === void 0 ? void 0 : cardEl.classList.add("flipped");
        if (this.flippedCards.length === 2) {
            this.isLocked = true;
            this.checkMatch();
        }
    }
    checkMatch() {
        const [firstId, secondId] = this.flippedCards;
        const firstCard = this.cards.find((c) => c.id === firstId);
        const secondCard = this.cards.find((c) => c.id === secondId);
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
            firstEl === null || firstEl === void 0 ? void 0 : firstEl.classList.add("matched");
            secondEl === null || secondEl === void 0 ? void 0 : secondEl.classList.add("matched");
            this.flippedCards = [];
            this.isLocked = false;
            if (this.matchedPairs === this.totalPairs) {
                this.gameWon();
            }
        }
        else {
            // No match
            this.playSound(this.errorSound);
            // Flip back after 1 second
            setTimeout(() => {
                firstCard.flipped = false;
                secondCard.flipped = false;
                const firstEl = this.boardEl.querySelector(`[data-id="${firstId}"]`);
                const secondEl = this.boardEl.querySelector(`[data-id="${secondId}"]`);
                firstEl === null || firstEl === void 0 ? void 0 : firstEl.classList.remove("flipped");
                secondEl === null || secondEl === void 0 ? void 0 : secondEl.classList.remove("flipped");
                this.flippedCards = [];
                this.isLocked = false;
            }, 1000);
        }
    }
    playSound(audio) {
        audio.currentTime = 0;
        audio.play().catch(() => { });
    }
    gameWon() {
        this.updateBestScore();
        setTimeout(() => {
            this.winMessageEl.classList.remove("hidden");
        }, 600);
    }
    updateBestScore() {
        if (this.bestScore === 0 || this.flips < this.bestScore) {
            this.bestScore = this.flips;
            this.saveBestScore(this.bestScore);
            this.bestScoreEl.textContent = String(this.bestScore);
        }
    }
    loadBestScore() {
        const saved = localStorage.getItem("memoryGameBestScore");
        return saved ? Number(saved) : 0;
    }
    saveBestScore(score) {
        localStorage.setItem("memoryGameBestScore", String(score));
    }
    resetGame() {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.fetchPokemonImages(randomOffset);
        });
    }
}
// Initialize game when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new MemoryGame();
});
