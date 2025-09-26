const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const modeToggleBtn = document.getElementById("mode-toggle");

// Audio files: Make sure ye teenon files aapke folder mein hain!
const moveSound = new Audio('click.mp3'); 
const winSound = new Audio('win.mp3');   // Yeh Win ke liye
const drawSound = new Audio('draw.mp3'); // Yeh Draw ke liye (Aapko naya file banana padega)

let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let isAiMode = true; // Default: Player vs Computer

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Initialize Board
for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick); 
    board.appendChild(cell);
}

// --- MODE TOGGLE LOGIC ---
modeToggleBtn.addEventListener("click", toggleGameMode);

function toggleGameMode() {
    isAiMode = !isAiMode; // Mode ko toggle karta hai
    
    // Button text aur color update karna
    if (isAiMode) {
        modeToggleBtn.textContent = "Switch to 2-Player Mode";
        modeToggleBtn.style.backgroundColor = "#4caf50";
    } else {
        modeToggleBtn.textContent = "Switch to Player vs Computer Mode";
        modeToggleBtn.style.backgroundColor = "#ff4b4b";
    }
    
    // Naye mode ke liye game ko reset karna
    resetGame();
}
// --- END MODE TOGGLE LOGIC ---


// --- AI LOGIC FUNCTIONS (Used only when isAiMode is true) ---

function checkPotentialMove(player) {
    for (const condition of winningConditions) {
        let count = 0;
        let emptyIndex = null;
        condition.forEach(index => {
            if (gameState[index] === player) {
                count++;
            } else if (gameState[index] === "") {
                emptyIndex = index;
            }
        });
        if (count === 2 && emptyIndex !== null) {
            return emptyIndex;
        }
    }
    return null;
}

function findAiMove() {
    // 1. Check if AI ('O') can win immediately
    let winMove = checkPotentialMove("O");
    if (winMove !== null) return winMove;
    // 2. Check if Human Player ('X') can win and block them
    let blockMove = checkPotentialMove("X");
    if (blockMove !== null) return blockMove;
    // 3. Take the Center spot if available
    if (gameState[4] === "") return 4;
    // 4. Take a random corner if available
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => gameState[i] === "");
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    // 5. Take any random empty spot (fallback)
    const emptyCells = gameState.map((val, index) => val === "" ? index : null).filter(val => val !== null);
    if (emptyCells.length > 0) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    return null;
}

function handleAiTurn() {
    if (!gameActive || currentPlayer !== 'O') return;
    // Small delay for UX
    setTimeout(() => {
        const moveIndex = findAiMove();
        if (moveIndex !== null) {
            makeMove(moveIndex);
        }
    }, 500); 
}

// --- CORE GAME FLOW FUNCTION ---

function makeMove(index) {
    const cell = board.children[index];
    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    
    // Play move sound
    moveSound.currentTime = 0; 
    moveSound.play().catch(e => console.log('Move sound error:', e)); 

    // Check Win
    if (checkWin()) {
        statusText.textContent = `🎉 ${isAiMode && currentPlayer === 'O' ? 'Computer' : 'Player ' + currentPlayer} wins! 🎉`; 
        statusText.classList.add("winner");
        gameActive = false;
        highlightWinningCells();
        
        // Play WIN sound
        winSound.play().catch(e => console.log('Win sound error:', e)); 
        return;
    }

    // Check Draw (No empty cells left)
    if (gameState.every(cell => cell !== "")) {
        statusText.textContent = "🤝 It's a Draw!";
        statusText.classList.add("draw");
        document.querySelectorAll(".cell").forEach(c => c.classList.add("draw")); 
        gameActive = false;
        
        // Play DRAW sound
        drawSound.play().catch(e => console.log('Draw sound error:', e));
        return;
    }

    // Switch Player
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateStatusText();

    // Trigger AI if it's AI mode AND 'O's turn
    if (isAiMode && currentPlayer === "O") { 
        handleAiTurn();
    }
}

// --- HANDLER (Works for both modes) ---
function handleCellClick(event) {
    const index = parseInt(event.target.dataset.index);

    // AI Mode mein, 'O' ki baari hone par click ko ignore karta hai
    if (isAiMode && currentPlayer === "O") { 
        return; 
    }

    if (gameState[index] !== "" || !gameActive) {
        return;
    }

    makeMove(index);
}

// --- HELPER FUNCTIONS ---

function checkWin() {
    return winningConditions.some(condition => {
        return condition.every(index => gameState[index] === currentPlayer);
    });
}

function highlightWinningCells() {
    winningConditions.forEach(condition => {
        if (condition.every(index => gameState[index] === currentPlayer)) {
            condition.forEach(index => {
                board.children[index].classList.add('winner');
            });
        }
    });
}

function updateStatusText() {
    // Status text checks the mode
    if (isAiMode && currentPlayer === "O") {
        statusText.textContent = "🤖 Computer's turn (O)";
    } else {
        statusText.textContent = `Player ${currentPlayer}'s turn`;
    }
}

resetBtn.addEventListener("click", resetGame);

function resetGame() {
    currentPlayer = "X";
    gameActive = true;
    gameState = ["", "", "", "", "", "", "", "", ""];
    
    // Reset styling and content
    statusText.classList.remove("winner", "draw");
    document.querySelectorAll(".cell").forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("x", "o", "winner", "draw");
    });
    
    updateStatusText(); 
    
    // AI Mode mein, agar 'O' se start ho raha hai toh AI ko trigger karta hai
    if (isAiMode && currentPlayer === "O") { 
        handleAiTurn();
    }
}

// Initial status update
updateStatusText();