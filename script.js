const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const phase = document.getElementById('phase');
const timer = document.getElementById('timer');
const instruction = document.getElementById('instruction');
const resetBtn = document.getElementById('resetBtn');
const diffBtns = document.querySelectorAll('.diff-btn');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let gamePhase = 1; // 1: Đặt quân, 2: Di chuyển quân
let piecesPlaced = { X: 0, O: 0 };
let selectedPiece = null;
let difficulty = 'easy';
let timeLeft = 120; // 2 phút = 120 giây
let timerInterval = null;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Chọn cấp độ
diffBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!gameActive) return;
        diffBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        difficulty = btn.getAttribute('data-level');
    });
});

function startTimer() {
    stopTimer();
    timeLeft = 120;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            stopTimer();
            endGame(`${currentPlayer === 'X' ? 'Bot (O)' : 'Người chơi (X)'} thắng! (Hết giờ)`);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.textContent = `Thời gian: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (!gameActive) return;

    if (currentPlayer === 'O') return; // Không cho người chơi đi khi đến lượt Bot

    if (gamePhase === 1) {
        // Giai đoạn 1: Đặt quân
        if (gameState[index] !== '') return;
        
        placePiece(index, currentPlayer);
        if (!checkWin()) {
            switchPlayer();
            if (currentPlayer === 'O') {
                setTimeout(botMove, 500);
            }
        }
    } else {
        // Giai đoạn 2: Di chuyển quân
        if (selectedPiece === null) {
            // Chọn quân để di chuyển
            if (gameState[index] === currentPlayer) {
                selectPiece(index);
            }
        } else {
            // Di chuyển quân đã chọn
            if (gameState[index] === '' && index !== selectedPiece) {
                movePiece(selectedPiece, index);
                if (!checkWin()) {
                    switchPlayer();
                    if (currentPlayer === 'O') {
                        setTimeout(botMove, 500);
                    }
                }
            } else if (gameState[index] === currentPlayer) {
                // Chọn quân khác
                selectPiece(index);
            }
        }
    }
}

function placePiece(index, player) {
    gameState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player.toLowerCase());
    piecesPlaced[player]++;
    
    updatePhaseDisplay();
}

function selectPiece(index) {
    cells.forEach(cell => cell.classList.remove('selected'));
    selectedPiece = index;
    cells[index].classList.add('selected');
    instruction.textContent = 'Nhấp vào ô trống để di chuyển quân';
}

function movePiece(fromIndex, toIndex) {
    const player = gameState[fromIndex];
    gameState[fromIndex] = '';
    gameState[toIndex] = player;
    
    cells[fromIndex].textContent = '';
    cells[fromIndex].classList.remove('x', 'o', 'selected');
    cells[toIndex].textContent = player;
    cells[toIndex].classList.add(player.toLowerCase());
    
    selectedPiece = null;
    updatePhaseDisplay();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Lượt của: ${currentPlayer} (${currentPlayer === 'X' ? 'Người chơi' : 'Bot'})`;
    
    if (gamePhase === 2 && currentPlayer === 'X') {
        instruction.textContent = 'Chọn quân X của bạn để di chuyển';
    }
    
    startTimer();
}

function updatePhaseDisplay() {
    if (gamePhase === 1) {
        const totalPlaced = piecesPlaced.X + piecesPlaced.O;
        phase.textContent = `Giai đoạn 1: Đặt quân (${totalPlaced}/6)`;
        
        if (piecesPlaced.X >= 3 && piecesPlaced.O >= 3) {
            gamePhase = 2;
            phase.textContent = 'Giai đoạn 2: Di chuyển quân';
            instruction.textContent = 'Chọn quân X của bạn để di chuyển';
        } else {
            instruction.textContent = 'Nhấp vào ô trống để đặt quân';
        }
    } else {
        phase.textContent = 'Giai đoạn 2: Di chuyển quân';
    }
}

function checkWin() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            endGame(`${gameState[a] === 'X' ? 'Người chơi (X)' : 'Bot (O)'} thắng!`);
            return true;
        }
    }
    return false;
}

function endGame(message) {
    gameActive = false;
    status.textContent = message;
    instruction.textContent = 'Nhấn "Chơi lại" để bắt đầu ván mới';
    stopTimer();
    cells.forEach(cell => cell.classList.remove('selected'));
}

// Bot AI
function botMove() {
    if (!gameActive || currentPlayer !== 'O') return;

    let move;
    if (difficulty === 'easy') {
        move = botMoveEasy();
    } else if (difficulty === 'medium') {
        move = botMoveMedium();
    } else {
        move = botMoveHard();
    }

    if (move) {
        if (gamePhase === 1) {
            placePiece(move, 'O');
        } else {
            movePiece(move.from, move.to);
        }
        
        if (!checkWin()) {
            switchPlayer();
        }
    }
}

function botMoveEasy() {
    if (gamePhase === 1) {
        // Đặt quân ngẫu nhiên, đôi khi chặn
        if (Math.random() < 0.3) {
            const blockMove = findBlockingMove('X');
            if (blockMove !== null) return blockMove;
        }
        return getRandomEmptyCell();
    } else {
        // Di chuyển ngẫu nhiên
        const oPieces = gameState.map((val, idx) => val === 'O' ? idx : null).filter(v => v !== null);
        const from = oPieces[Math.floor(Math.random() * oPieces.length)];
        const to = getRandomEmptyCell();
        return { from, to };
    }
}

function botMoveMedium() {
    if (gamePhase === 1) {
        // Ưu tiên: Thắng > Chặn > Ngẫu nhiên
        const winMove = findWinningMove('O');
        if (winMove !== null) return winMove;
        
        const blockMove = findBlockingMove('X');
        if (blockMove !== null) return blockMove;
        
        return getRandomEmptyCell();
    } else {
        // Tìm nước đi tốt nhất
        const bestMove = findBestMove('O', 1);
        return bestMove || getRandomMove('O');
    }
}

function botMoveHard() {
    if (gamePhase === 1) {
        const winMove = findWinningMove('O');
        if (winMove !== null) return winMove;
        
        const blockMove = findBlockingMove('X');
        if (blockMove !== null) return blockMove;
        
        // Ưu tiên ô giữa và góc
        if (gameState[4] === '') return 4;
        const corners = [0, 2, 6, 8].filter(i => gameState[i] === '');
        if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
        
        return getRandomEmptyCell();
    } else {
        // Sử dụng Minimax cho giai đoạn 2
        return minimaxMove();
    }
}

// Thuật toán Minimax cho giai đoạn di chuyển
function minimaxMove() {
    let bestScore = -Infinity;
    let bestMove = null;
    
    const oPieces = gameState.map((val, idx) => val === 'O' ? idx : null).filter(v => v !== null);
    const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
    
    // Thử tất cả các nước đi có thể
    for (let from of oPieces) {
        for (let to of emptyCells) {
            // Thực hiện nước đi
            const temp = gameState[from];
            gameState[from] = '';
            gameState[to] = 'O';
            
            // Tính điểm bằng Minimax
            const score = minimax(0, false, -Infinity, Infinity);
            
            // Hoàn tác nước đi
            gameState[from] = temp;
            gameState[to] = '';
            
            // Cập nhật nước đi tốt nhất
            if (score > bestScore) {
                bestScore = score;
                bestMove = { from, to };
            }
        }
    }
    
    return bestMove || getRandomMove('O');
}

// Hàm Minimax với Alpha-Beta Pruning
function minimax(depth, isMaximizing, alpha, beta) {
    // Kiểm tra điều kiện dừng
    if (checkWinForPlayer('O')) return 10 - depth;
    if (checkWinForPlayer('X')) return depth - 10;
    if (depth >= 4) return evaluatePosition('O') - evaluatePosition('X'); // Giới hạn độ sâu
    
    const currentPlayer = isMaximizing ? 'O' : 'X';
    const pieces = gameState.map((val, idx) => val === currentPlayer ? idx : null).filter(v => v !== null);
    const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
    
    if (emptyCells.length === 0) return 0;
    
    if (isMaximizing) {
        let maxScore = -Infinity;
        
        for (let from of pieces) {
            for (let to of emptyCells) {
                const temp = gameState[from];
                gameState[from] = '';
                gameState[to] = currentPlayer;
                
                const score = minimax(depth + 1, false, alpha, beta);
                
                gameState[from] = temp;
                gameState[to] = '';
                
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                
                if (beta <= alpha) break; // Alpha-Beta Pruning
            }
            if (beta <= alpha) break;
        }
        
        return maxScore;
    } else {
        let minScore = Infinity;
        
        for (let from of pieces) {
            for (let to of emptyCells) {
                const temp = gameState[from];
                gameState[from] = '';
                gameState[to] = currentPlayer;
                
                const score = minimax(depth + 1, true, alpha, beta);
                
                gameState[from] = temp;
                gameState[to] = '';
                
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                
                if (beta <= alpha) break; // Alpha-Beta Pruning
            }
            if (beta <= alpha) break;
        }
        
        return minScore;
    }
}

function findWinningMove(player) {
    for (let i = 0; i < 9; i++) {
        if (gameState[i] === '') {
            gameState[i] = player;
            const isWin = checkWinForPlayer(player);
            gameState[i] = '';
            if (isWin) return i;
        }
    }
    return null;
}

function findBlockingMove(opponent) {
    return findWinningMove(opponent);
}

function checkWinForPlayer(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
            return true;
        }
    }
    return false;
}

function findBestMove(player, depth) {
    const pieces = gameState.map((val, idx) => val === player ? idx : null).filter(v => v !== null);
    const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
    
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let from of pieces) {
        for (let to of emptyCells) {
            // Simulate move
            const temp = gameState[from];
            gameState[from] = '';
            gameState[to] = player;
            
            if (checkWinForPlayer(player)) {
                gameState[from] = temp;
                gameState[to] = '';
                return { from, to };
            }
            
            const score = evaluatePosition(player);
            if (score > bestScore) {
                bestScore = score;
                bestMove = { from, to };
            }
            
            gameState[from] = temp;
            gameState[to] = '';
        }
    }
    
    return bestMove;
}

function evaluatePosition(player) {
    let score = 0;
    const opponent = player === 'X' ? 'O' : 'X';
    
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        const line = [gameState[a], gameState[b], gameState[c]];
        const playerCount = line.filter(v => v === player).length;
        const opponentCount = line.filter(v => v === opponent).length;
        const emptyCount = line.filter(v => v === '').length;
        
        if (playerCount === 2 && emptyCount === 1) score += 10;
        if (playerCount === 1 && emptyCount === 2) score += 1;
        if (opponentCount === 2 && emptyCount === 1) score += 5;
    }
    
    return score;
}

function getRandomEmptyCell() {
    const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
}

function getRandomMove(player) {
    const pieces = gameState.map((val, idx) => val === player ? idx : null).filter(v => v !== null);
    const from = pieces[Math.floor(Math.random() * pieces.length)];
    const to = getRandomEmptyCell();
    return to !== null ? { from, to } : null;
}

function resetGame() {
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    gamePhase = 1;
    piecesPlaced = { X: 0, O: 0 };
    selectedPiece = null;
    
    status.textContent = 'Lượt của: X (Người chơi)';
    phase.textContent = 'Giai đoạn 1: Đặt quân (0/6)';
    instruction.textContent = 'Nhấp vào ô trống để đặt quân X';
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'selected');
    });
    
    startTimer();
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);

// Bắt đầu game
startTimer();
