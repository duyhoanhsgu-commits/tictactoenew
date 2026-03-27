const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const phase = document.getElementById('phase');
const timer = document.getElementById('timer');
const instruction = document.getElementById('instruction');
const resetBtn = document.getElementById('resetBtn');
const resultModal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');
const playAgainBtn = document.getElementById('playAgainBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeHelpBtn = document.getElementById('closeHelpBtn');
const difficultyScreen = document.getElementById('difficultyScreen');
const gameScreen = document.getElementById('gameScreen');
const difficultyCards = document.querySelectorAll('.difficulty-card');
const backBtn = document.getElementById('backBtn');
const currentDifficultyText = document.getElementById('currentDifficultyText');

let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let gamePhase = 1; // 1: Đặt quân, 2: Di chuyển quân
let piecesPlaced = { X: 0, O: 0 };
let selectedPiece = null;
let difficulty = 'easy';
let timeLeft = { X: 30, O: 30 }; // Mỗi người có 30 giây riêng
let timerInterval = null;
let turnStartTime = null;
let gameStarted = false; // Kiểm tra game đã bắt đầu chưa

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Chọn cấp độ và bắt đầu game
difficultyCards.forEach(card => {
    card.addEventListener('click', () => {
        difficulty = card.getAttribute('data-level');
        const difficultyNames = {
            'easy': 'Dễ',
            'medium': 'Trung bình',
            'hard': 'Khó'
        };
        currentDifficultyText.textContent = difficultyNames[difficulty];
        
        // Chuyển sang màn hình game
        difficultyScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Reset game
        resetGame();
    });
});

// Quay lại màn hình chọn cấp độ
backBtn.addEventListener('click', () => {
    gameScreen.classList.add('hidden');
    difficultyScreen.classList.remove('hidden');
    stopTimer();
    gameActive = false;
});

function startTimer() {
    if (timerInterval) return; // Đã chạy rồi thì không start lại
    
    turnStartTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
        if (elapsed > 0) {
            timeLeft[currentPlayer] = Math.max(0, timeLeft[currentPlayer] - elapsed);
            turnStartTime = Date.now();
            updateTimerDisplay();
            
            if (timeLeft[currentPlayer] <= 0) {
                stopTimer();
                endGame(`${currentPlayer === 'X' ? 'Bot (O)' : 'Người chơi (X)'} thắng! (Hết giờ)`);
            }
        }
    }, 100);
}

function pauseTimer() {
    // Cập nhật thời gian trước khi tạm dừng
    if (turnStartTime) {
        const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
        timeLeft[currentPlayer] = Math.max(0, timeLeft[currentPlayer] - elapsed);
        updateTimerDisplay();
    }
}

function resumeTimer() {
    // Bắt đầu đếm cho người chơi mới
    turnStartTime = Date.now();
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const xMinutes = Math.floor(timeLeft.X / 60);
    const xSeconds = timeLeft.X % 60;
    const oMinutes = Math.floor(timeLeft.O / 60);
    const oSeconds = timeLeft.O % 60;
    
    timer.innerHTML = `
        <span style="color: #667eea; font-weight: bold;">X: ${xMinutes}:${xSeconds.toString().padStart(2, '0')}</span> | 
        <span style="color: #764ba2; font-weight: bold;">O: ${oMinutes}:${oSeconds.toString().padStart(2, '0')}</span>
    `;
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (!gameActive) return;

    if (currentPlayer === 'O') return; // Không cho người chơi đi khi đến lượt Bot

    // Bắt đầu đếm giờ khi người chơi đánh nước đầu tiên
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    if (gamePhase === 1) {
        // Giai đoạn 1: Đặt quân
        if (gameState[index] !== '') return;
        
        placePiece(index, currentPlayer);
        if (!checkWin()) {
            switchPlayer();
            if (currentPlayer === 'O') {
                botMove(); // Bỏ setTimeout ở đây vì đã có trong botMove
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
                        botMove(); // Bỏ setTimeout ở đây vì đã có trong botMove
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
    pauseTimer(); // Tạm dừng và cập nhật thời gian người chơi hiện tại
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Lượt của: ${currentPlayer} (${currentPlayer === 'X' ? 'Người chơi' : 'Bot'})`;
    
    if (gamePhase === 2 && currentPlayer === 'X') {
        instruction.textContent = 'Chọn quân X của bạn để di chuyển';
    }
    
    resumeTimer(); // Bắt đầu đếm cho người chơi mới
}

function updatePhaseDisplay() {
    if (gamePhase === 1) {
        const totalPlaced = piecesPlaced.X + piecesPlaced.O;
        phase.textContent = `Giai đoạn 1: Đặt quân (${totalPlaced}/6)`;
        
        if (piecesPlaced.X >= 3 && piecesPlaced.O >= 3) {
            gamePhase = 2;
            phase.textContent = 'Giai đoạn 2: Di chuyển quân';
            instruction.textContent = 'Chọn quân X của bạn để di chuyển';
            
            // Hiển thị thông báo chuyển giai đoạn
            showPhaseNotification();
        } else {
            instruction.textContent = 'Nhấp vào ô trống để đặt quân';
        }
    } else {
        phase.textContent = 'Giai đoạn 2: Di chuyển quân';
    }
}

function showPhaseNotification() {
    const notification = document.createElement('div');
    notification.className = 'phase-notification';
    notification.innerHTML = '<h3>🎯 Giai đoạn 2</h3><p>Bắt đầu di chuyển quân!</p>';
    document.body.appendChild(notification);
    
    // Hiển thị animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Tự động ẩn sau 1 giây
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 1000);
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
    
    // Hiển thị modal kết quả
    showResultModal(message);
}

function showResultModal(message) {
    // Xác định tiêu đề và thông điệp
    if (message.includes('Người chơi (X) thắng')) {
        resultTitle.textContent = '🎉 Chiến thắng!';
        resultTitle.style.color = '#667eea';
    } else if (message.includes('Bot (O) thắng')) {
        resultTitle.textContent = '😔 Thua cuộc!';
        resultTitle.style.color = '#e74c3c';
    } else {
        resultTitle.textContent = '🤝 Hòa!';
        resultTitle.style.color = '#f39c12';
    }
    
    resultMessage.textContent = message;
    resultModal.classList.add('show');
}

function hideResultModal() {
    resultModal.classList.remove('show');
}

function showHelpModal() {
    helpModal.classList.add('show');
}

function hideHelpModal() {
    helpModal.classList.remove('show');
}

// Bot AI
function botMove() {
    if (!gameActive || currentPlayer !== 'O') return;

    // Tạo delay để thời gian bot chạy (0.5 - 2 giây tùy cấp độ)
    let thinkTime = 500;
    if (difficulty === 'medium') thinkTime = 1000;
    if (difficulty === 'hard') thinkTime = 1500;

    setTimeout(() => {
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
    }, thinkTime);
}

function botMoveEasy() {
    if (gamePhase === 1) {
        // Đặt quân ngẫu nhiên, rất ít khi chặn (20% cơ hội)
        if (Math.random() < 0.2) {
            const blockMove = findBlockingMove('X');
            if (blockMove !== null) return blockMove;
        }
        return getRandomEmptyCell();
    } else {
        // Giai đoạn 2: Chủ yếu di chuyển ngẫu nhiên
        const oPieces = gameState.map((val, idx) => val === 'O' ? idx : null).filter(v => v !== null);
        const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
        
        if (oPieces.length === 0 || emptyCells.length === 0) {
            return getRandomMove('O');
        }
        
        // 30% cơ hội thắng nếu có thể
        if (Math.random() < 0.3) {
            for (let from of oPieces) {
                for (let to of emptyCells) {
                    gameState[from] = '';
                    gameState[to] = 'O';
                    const isWin = checkWinForPlayer('O');
                    gameState[from] = 'O';
                    gameState[to] = '';
                    if (isWin) {
                        return { from, to };
                    }
                }
            }
        }
        
        // 40% cơ hội chặn nếu người chơi sắp thắng
        if (Math.random() < 0.4) {
            const xPieces = gameState.map((val, idx) => val === 'X' ? idx : null).filter(v => v !== null);
            for (let xFrom of xPieces) {
                for (let xTo of emptyCells) {
                    gameState[xFrom] = '';
                    gameState[xTo] = 'X';
                    const wouldWin = checkWinForPlayer('X');
                    gameState[xFrom] = 'X';
                    gameState[xTo] = '';
                    
                    if (wouldWin) {
                        for (let oFrom of oPieces) {
                            return { from: oFrom, to: xTo };
                        }
                    }
                }
            }
        }
        
        // Còn lại: di chuyển ngẫu nhiên
        const from = oPieces[Math.floor(Math.random() * oPieces.length)];
        const to = emptyCells[Math.floor(Math.random() * emptyCells.length)];
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
        // Giai đoạn 2: Di chuyển quân
        const oPieces = gameState.map((val, idx) => val === 'O' ? idx : null).filter(v => v !== null);
        const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
        
        if (oPieces.length === 0 || emptyCells.length === 0) {
            return getRandomMove('O');
        }
        
        // Ưu tiên 1: Thắng ngay
        for (let from of oPieces) {
            for (let to of emptyCells) {
                gameState[from] = '';
                gameState[to] = 'O';
                const isWin = checkWinForPlayer('O');
                gameState[from] = 'O';
                gameState[to] = '';
                if (isWin) {
                    return { from, to };
                }
            }
        }
        
        // Ưu tiên 2: Chặn người chơi thắng
        const xPieces = gameState.map((val, idx) => val === 'X' ? idx : null).filter(v => v !== null);
        for (let xFrom of xPieces) {
            for (let xTo of emptyCells) {
                gameState[xFrom] = '';
                gameState[xTo] = 'X';
                const wouldWin = checkWinForPlayer('X');
                gameState[xFrom] = 'X';
                gameState[xTo] = '';
                
                if (wouldWin) {
                    // Di chuyển quân O đến vị trí đó để chặn
                    for (let oFrom of oPieces) {
                        return { from: oFrom, to: xTo };
                    }
                }
            }
        }
        
        // Ưu tiên 3: Tìm nước đi tốt nhất dựa trên đánh giá
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let from of oPieces) {
            for (let to of emptyCells) {
                gameState[from] = '';
                gameState[to] = 'O';
                
                const score = evaluatePosition('O');
                
                gameState[from] = 'O';
                gameState[to] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { from, to };
                }
            }
        }
        
        return bestMove || getRandomMove('O');
    }
}

function botMoveHard() {
    if (gamePhase === 1) {
        // Giai đoạn 1: Đặt quân
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
        // Giai đoạn 2: Di chuyển quân - sử dụng Minimax
        const oPieces = gameState.map((val, idx) => val === 'O' ? idx : null).filter(v => v !== null);
        const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
        
        // Kiểm tra có quân và ô trống không
        if (oPieces.length === 0 || emptyCells.length === 0) {
            console.log('Không có quân hoặc ô trống');
            return null;
        }
        
        // Ưu tiên 1: Kiểm tra thắng ngay
        for (let from of oPieces) {
            for (let to of emptyCells) {
                gameState[from] = '';
                gameState[to] = 'O';
                const isWin = checkWinForPlayer('O');
                gameState[from] = 'O';
                gameState[to] = '';
                if (isWin) {
                    console.log('Bot tìm thấy nước thắng:', from, '->', to);
                    return { from, to };
                }
            }
        }
        
        // Ưu tiên 2: Chặn người chơi thắng
        const xPieces = gameState.map((val, idx) => val === 'X' ? idx : null).filter(v => v !== null);
        for (let xFrom of xPieces) {
            for (let xTo of emptyCells) {
                gameState[xFrom] = '';
                gameState[xTo] = 'X';
                const wouldWin = checkWinForPlayer('X');
                gameState[xFrom] = 'X';
                gameState[xTo] = '';
                
                if (wouldWin) {
                    // Chặn bằng cách di chuyển quân O đến vị trí đó
                    const oFrom = oPieces[0]; // Lấy quân O đầu tiên
                    console.log('Bot chặn:', oFrom, '->', xTo);
                    return { from: oFrom, to: xTo };
                }
            }
        }
        
        // Ưu tiên 3: Sử dụng Minimax
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let from of oPieces) {
            for (let to of emptyCells) {
                gameState[from] = '';
                gameState[to] = 'O';
                
                const score = minimax(1, false, -Infinity, Infinity);
                
                gameState[from] = 'O';
                gameState[to] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { from, to };
                }
            }
        }
        
        // Nếu vẫn không có nước đi, chọn ngẫu nhiên
        if (!bestMove) {
            const from = oPieces[Math.floor(Math.random() * oPieces.length)];
            const to = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            console.log('Bot đi ngẫu nhiên:', from, '->', to);
            return { from, to };
        }
        
        console.log('Bot đi Minimax:', bestMove.from, '->', bestMove.to, 'score:', bestScore);
        return bestMove;
    }
}

// Thuật toán Minimax cho giai đoạn di chuyển (không dùng nữa, logic đã tích hợp vào botMoveHard)

// Hàm Minimax với Alpha-Beta Pruning
function minimax(depth, isMaximizing, alpha, beta) {
    // Kiểm tra điều kiện dừng
    if (checkWinForPlayer('O')) return 100 - depth;
    if (checkWinForPlayer('X')) return depth - 100;
    if (depth >= 3) return evaluatePosition('O') - evaluatePosition('X'); // Giới hạn độ sâu
    
    const currentPlayer = isMaximizing ? 'O' : 'X';
    const pieces = gameState.map((val, idx) => val === currentPlayer ? idx : null).filter(v => v !== null);
    const emptyCells = gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
    
    if (emptyCells.length === 0 || pieces.length === 0) return 0;
    
    if (isMaximizing) {
        let maxScore = -Infinity;
        
        for (let from of pieces) {
            for (let to of emptyCells) {
                gameState[from] = '';
                gameState[to] = 'O';
                
                const score = minimax(depth + 1, false, alpha, beta);
                
                gameState[from] = 'O';
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
                gameState[from] = '';
                gameState[to] = 'X';
                
                const score = minimax(depth + 1, true, alpha, beta);
                
                gameState[from] = 'X';
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
    hideResultModal(); // Đóng modal nếu đang mở
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    gamePhase = 1;
    piecesPlaced = { X: 0, O: 0 };
    selectedPiece = null;
    timeLeft = { X: 30, O: 30 }; // Reset thời gian cho cả 2 người
    gameStarted = false; // Reset trạng thái game
    
    status.textContent = 'Lượt của: X (Người chơi)';
    phase.textContent = 'Giai đoạn 1: Đặt quân (0/6)';
    instruction.textContent = 'Nhấp vào ô trống để đặt quân X';
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'selected');
    });
    
    stopTimer(); // Dừng timer
    updateTimerDisplay(); // Cập nhật hiển thị về 2:00
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', () => {
    hideResultModal();
    resetGame();
});

// Đóng modal kết quả khi click bên ngoài
resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        hideResultModal();
        resetGame();
    }
});

// Mở modal hướng dẫn
helpBtn.addEventListener('click', showHelpModal);
closeHelpBtn.addEventListener('click', hideHelpModal);

// Đóng modal hướng dẫn khi click bên ngoài
helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        hideHelpModal();
    }
});

// Bắt đầu game (không start timer ngay)
// updateTimerDisplay(); // Không cần vì sẽ được gọi khi chọn cấp độ
