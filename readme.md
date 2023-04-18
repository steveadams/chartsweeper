## Chartsweeper

This is a clone of the classic game Minesweeper. It's implemented using TypeScript and React, using state charts ([X State](https://github.com/statelyai/xstate)) to manage game state and transitions.

*TODO: Replace with actual gameplay*
<img src="./public/gameplay.png" alt="An image of minesweeper in mid-play, showing revealed and hidden tiles">

## Mental Map

Playing the game and asserting UI interactions, behaviours, features

- Features
  1. Game Management
    - Configuration
      - Default games: Initialize a game using pre-configured parameters
      - Custom Games
        - Allow a user to select height, width, and # mines in the field
        - Note, the live game allows setting a 10x10 field with > 100 mines. Clicking any cell leads to a win 😎.
  3. Controls
    - Left click reveals the cell.
    - Right click or cmd + click to flag an empty cell.
  4. Flag counter
    - Top left corner shows the number of flags remaining
    - No interactions
  5. Silent Observer 🙂
    - Top center shows a face which serves two functions:
      1. Clicking it restarts the current game
      2. It emotes board state:
        - 🙂: Awaiting input
        - 😮: When a cell is clicked and the cursor is still in the pressed state
        - 😵: User clicked a mine (game over, board is frozen)
        - 😎: User won the game!
  6. Timer
    - Top right corner shows a timer which starts when the first cell is clicked
      - No interactions
      - It stops at 999
      - Does the game end at 999 seconds? Let's see
- Behaviours
  - Clicking cells:
    - Untouched cells:
      - Reveals contents of the cell. If:
        - Cell is a mine: Game over. Reveal all other mines, don't traverse adjacent cells
        - Cell has adjacent mine(s): Reveal the number of adjacent mines, do not traverse neighbours
        - Cell is clear: show cleared cell, traverse neighbours.
    - Flagged and cleared cells: Nothing happens (but our friend up top is still concerned)
- Key takeaways
  - Important algorithms:
    - Grid generation: efficiently insert the correct number of clear cells and mines
    - Grid discovery: efficiently traverse the grid to find cells which are clear, or are clear *and* have adjacent cells with mines
  - TDD opportunities
    - Write grid generation against tests (given these inputs, expect grid with dimensions *`x*y`* with *`n`* mines)
    - Grid discovery should be simple to test against expected results

## High Level Plan

### Responsibility Chain

- Game component handles:
  - Configuration
  - Time
  - Flags
  - Initializing game data
  - Tracking win progress (win = revealed cells === length * width - # mines)
  - Capturing losing clicks
- Grid component handles:
  - Presenting game data in cells
- Cell component handles:
  - Managing and presenting cell data
  - Handling cell interactions
  - Dispatching searches to adjacent cells when necessary

### Process

1. Rough DOM layout
2. Game generation
  1. Get a naive board generating based on given dimensions
  2. Add UI to configure custom games
  3. Tune the generation of the board to be correct
    - Use a probability strategy to place mines as the grid is created. Track how many mines are placed to adjust probability accordingly. Should be able to get this working reliably if the probability is skewed higher towards the end (if necessary)
3. Game interactions, states
  1. Init
    - Generate the board
    - Allow interactions
  2. Add 🙂 😮 😵 😎 guy to represent game states
    - game.ready -> 🙂
    - game.clicking -> 😮
    - game.over -> 😵
    - game.win -> 😎
  3. Playing
    - Handle mouse down, game reset
  4. Win, game over
    - Freeze all interactions
    - On win, flag all remaining mines
    - On lose, expose all mines
    - In both cases, maybe handle with event listener
4. Cell interactions, states
  1. Start with basics, no traversal
    - Hidden, revealed, and simulated adjacency data states
    - Trigger "game over" on mine click
    - Support adding flags
  2. Add traversal
    - Use something like a depth first search. Use cell state to avoid processing cells already visited
    - Create some simple fixtures to test against
    - Perform traversal at the cell level (not grid or game). Rather than using recursion, this will use a pattern where adjacent cells are conditionally called.
5. Flag counter
6. Timer
7. Testing
