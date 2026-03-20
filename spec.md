Description of Memory Card Game

1. Game Idea
   ● This is a memory training game.
   ● Players must find matching pairs of cards by flipping them on the board.
   ● The game ends when all card pairs have been found.

2. Rules of Play
   1. The game board consists of many face-down cards (e.g., 16 cards arranged in a 4x4grid).
   2. Players choose 2 cards in each turn:
      ● If they are the same → the cards will remain face-up.
      ● If they are different → the cards will automatically flip back after 1-2 seconds.
   3. Each time a correct pair is found → the player scores points.
   4. The game ends when all cards on the board have been successfully matched.

3. Game Objectives
   ● Find all card pairs in the shortest time or with the fewest flips.
   ● Maintain and break the "Best Score" record (highest score) achieved previously.

Detailed Requirements

1. Environment Setup
   ● Create a new project: memory-game/
   File structure:memory-game/
   │── index.html
   │── style.css
   │── app.ts
   └── app.js (compiled from app.ts)
   ● Configure tsc to compile TypeScript to JavaScript.

2. Basic Interface (UI)
   ● Main page includes:
   ● Game title: "Memory Game".
   ● Score information (number of pairs found).
   ● Best Score information (highest score, retrieved from localStorage).
   ● Game Board area: 4x4 card grid.
   ● Each card:
   ● Back: displays ?.
   ● Front: displays an icon (emojis/images).
   ● When flipped: displays the front.

3. Main Functions
   1. Create card set
      ● Use 8 pairs of icons (emojis or images).
      ● Total of 16 cards.
      ● Cards are randomly shuffled before display.
   2. Flip cards
      ● When a player clicks on a card: the card flips up, showing the icon.
      ● Only a maximum of 2 cards can be flipped per turn.
   3. Compare card pairs
      ● If 2 cards are the same → they remain face-up (considered "matched").
      ● If different → they automatically flip back after ~1 second.
   4. Score
      ● Each time a correct pair is found, score +1.● Display current score on the screen.
   5. Best Score
      ● Save the highest score to localStorage.
      ● When reopening the game, display the previous best score.
   6. End game
      ● When all pairs are found → display "You Win!".
      ● Automatically reset the game board for a new round.

4. Technical Requirements
   ● Use TypeScript to write all logic.
   ● Create Card interface (including id, value, flipped/matched status).
   ● Write MemoryGame class to manage all logic (state, render, check match, reset game).
   ● Use DOM API to render the card interface.
   ● Manage events using event listeners in TypeScript
   ● Use Pokemon images from public APIs like https://pokeapi.co/, https://unsplash.com/,etc. direct API calls are required.
