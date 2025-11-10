var origBoard;
const huPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
    // Rows
    [0, 1, 2],  // Top row
    [3, 4, 5],  // Middle row
    [6, 7, 8],  // Bottom row
    
    // Columns
    [0, 3, 6],  // Left column
    [1, 4, 7],  // Middle column
    [2, 5, 8],  // Right column
    
    // Diagonals
    [0, 4, 8],  // Top-left to bottom-right
    [2, 4, 6]   // Top-right to bottom-left
];
let moveHistory = []; 
let currentMoveIndex = -1; // Track where we are in history

const cells = document.querySelectorAll('.cell'); // Selects all cells
startGame();

function startGame() {
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(9).keys()) // Creates array [0,1,2,3,4,5,6,7,8] to track board state
    moveHistory = []; // Reset history
    currentMoveIndex = -1; // Reset index

    for (var i = 0; i < cells.length; i++){
        cells[i].innerText = '';                    // Clears X/O from cell
        cells[i].style.removeProperty('background-color');  // Removes highlighting
        cells[i].addEventListener('click', turnClick, false); // Adds click handler
    }
}

function turnClick(square) {

    // Make so you can't click in board that has already been clicked
    if (typeof origBoard[square.target.id] == 'number') { // if its played square then array of number position is stored there so we can know its number and know its alr been played 
        // console.log(square); If you do this you can see that for eg if you clic the first square on box you will see 0 and if second square two you see 2  and so on...
        turn(square.target.id, huPlayer)
        if (!checkTie()) turn(bestSpot(), aiPlayer);
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;

    // Add to move history
    moveHistory.push({squareId: squareId, player: player});
    currentMoveIndex = moveHistory.length - 1;

    let gameWon = checkWin(origBoard, player)
    if (gameWon) gameOver(gameWon)
}

// Determine Winner

function checkWin(board, player) {
    let plays = [];  // Empty array to store positions
    
    // Loop through all 9 board positions (0-8)
    for (let i = 0; i < board.length; i++) {
        // Check if this position contains the player's symbol
        if (board[i] === player) {
            plays.push(i);  // Add position to the array
        }
    }

    let gameWon = null; // If nobody wins it will be null
    // Check each winning combination
    for (let i = 0; i < winCombos.length; i++) {
        // Check if ALL positions in this combo are in the player's moves
        if (winCombos[i].every(position => plays.includes(position))) {
            gameWon = {index: i, player: player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
        gameWon.player == huPlayer ? "blue" : "red"  // If its human player background color is blue and if its AI its red
    }
    for (var i=0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false); // Remove that clicking functionality now that game is over
    }
    declareWinner(gameWon.player == huPlayer ? "You win!" : "You lose!");
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number'); // goes through each element in board array and checks if each element in number and returns new array containing only empty squares
}

function bestSpot() {
    // Really simple just will play the first empty square as its move
    // return emptySquares()[0];
    return minimax(origBoard, aiPlayer).index;
}

function checkTie() { 
    // Just plays the first empty square
    if(emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie!");
        return true;
    }
    return false; 
}

function previousMove() {
    if (currentMoveIndex >= 0) {
        // Get the last move
        const lastMove = moveHistory[currentMoveIndex];
        
        // Undo the move
        origBoard[lastMove.squareId] = parseInt(lastMove.squareId); // Reset to original number
        document.getElementById(lastMove.squareId).innerText = '';
        
        // Remove from history
        moveHistory.pop();
        currentMoveIndex--;
        
        // Re-enable click events if game was over
        for (var i = 0; i < cells.length; i++) {
            cells[i].addEventListener('click', turnClick, false);
        }
        document.querySelector(".endgame").style.display = "none";
    }
}

function minimax(newBoard, player) {
    // Get available spots
    var availSpots = emptySquares(newBoard);

    // Check for terminal states
    if (checkWin(newBoard, huPlayer)) {
        return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)) {
        return {score: 10};
    } else if (availSpots.length === 0) {
        return {score: 0};
    }

    // Array to collect all moves
    var moves = [];

    // Loop through available spots
    for (var i = 0; i < availSpots.length; i++) {
        // Create object for this move
        var move = {};
        move.index = availSpots[i];  // Store position (0-8)
        
        // Make the move temporarily
        newBoard[availSpots[i]] = player;

        // Recursively get score from resulting position
        if (player === aiPlayer) {
            // If AI just moved, next is human's turn (minimizing)
            var result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            // If human just moved, next is AI's turn (maximizing)  
            var result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        // Undo the move
        newBoard[availSpots[i]] = move.index;

        // Store the move
        moves.push(move);
    }

    // Choose best move based on player
    var bestMove;
    if (player === aiPlayer) {
        // AI wants MAXIMUM score
        var bestScore = -Infinity;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        // Human wants MINIMUM score
        var bestScore = Infinity;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    // Return the best move
    return moves[bestMove];
}