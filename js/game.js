// Game Logic
import { WINNING_CONDITIONS, GAME_CONFIG, PLAYER, GAME_PHASE, DIFFICULTY_NAMES } from './constants.js';
import { Bot } from './bot.js';
import { Timer } from './timer.js';
import { UI } from './ui.js';

export class Game {
    constructor() {
        this.ui = new UI();
        this.bot = new Bot('easy');
        this.timer = new Timer(
            (timeLeft) => this.ui.updateTimer(timeLeft),
            (player) => this.handleTimeout(player)
        );
        
        this.gameMode = 'pva'; // 'pvp' hoặc 'pva'
        this.playerCharacter = 'rabbit'; // 'rabbit' hoặc 'turtle'
        this.reset();
        this.setupEventListeners();
    }

    reset() {
        this.currentPlayer = PLAYER.HUMAN;
        this.gameState = Array(GAME_CONFIG.TOTAL_CELLS).fill('');
        this.gameActive = true;
        this.gamePhase = GAME_PHASE.PLACEMENT;
        this.piecesPlaced = { [PLAYER.HUMAN]: 0, [PLAYER.BOT]: 0 };
        this.selectedPiece = null;
        this.gameStarted = false;
        this.botIsThinking = false;
        this.botMoveTimeout = null;
        
        this.timer.reset();
        this.timer.setCurrentPlayer(this.currentPlayer);
        
        // Set thinking indicator cho người chơi đầu tiên
        this.ui.setThinking(this.currentPlayer);
        
        const playerName = this.gameMode === 'pvp' ? 'Người chơi 1' : 'Người chơi';
        this.ui.updateStatus(`Lượt của: ${PLAYER.HUMAN} (${playerName})`);
        this.ui.updatePhase('Giai đoạn 1: Đặt quân (0/6)');
        this.ui.updateInstruction('Nhấp vào ô trống để đặt quân X');
        this.ui.clearAllCells();
        this.ui.updateTimer(this.timer.timeLeft);
        this.ui.updatePieces(this.piecesPlaced);
    }

    setupEventListeners() {
        // Welcome screen buttons
        this.ui.elements.startBtn.addEventListener('click', () => {
            this.ui.hideWelcomeScreen();
            this.ui.showGameModeScreen();
        });

        this.ui.elements.welcomeHelpBtn.addEventListener('click', () => {
            this.ui.showHelpModal();
        });

        // Game mode selection
        this.ui.elements.pvpMode.addEventListener('click', () => {
            this.gameMode = 'pvp';
            this.timer.setGameMode('pvp');
            this.ui.setCharacterNames('Người chơi 1', 'Người chơi 2');
            this.ui.setAvatars('assets/images/Tho.png', 'assets/images/rua.png');
            this.ui.hideGameModeScreen();
            this.ui.showGameScreen();
            this.reset();
        });

        this.ui.elements.pvaMode.addEventListener('click', () => {
            this.gameMode = 'pva';
            this.timer.setGameMode('pva');
            this.ui.hideGameModeScreen();
            this.ui.showCharacterSelectScreen();
        });

        this.ui.elements.backToWelcomeBtn.addEventListener('click', () => {
            this.ui.showWelcomeScreen();
        });

        // Character selection
        this.ui.elements.selectRabbit.addEventListener('click', () => {
            this.playerCharacter = 'rabbit';
            this.ui.hideCharacterSelectScreen();
            this.ui.showDifficultyScreen();
        });

        this.ui.elements.selectTurtle.addEventListener('click', () => {
            this.playerCharacter = 'turtle';
            this.ui.hideCharacterSelectScreen();
            this.ui.showDifficultyScreen();
        });

        this.ui.elements.backToModeBtn.addEventListener('click', () => {
            this.ui.hideCharacterSelectScreen();
            this.ui.showGameModeScreen();
        });

        // Cell clicks
        this.ui.elements.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });

        // Difficulty selection
        this.ui.elements.difficultyCards.forEach(card => {
            card.addEventListener('click', () => {
                const difficulty = card.getAttribute('data-level');
                this.bot.setDifficulty(difficulty);
                this.ui.setDifficultyText(DIFFICULTY_NAMES[difficulty]);
                
                // Set avatar dựa trên nhân vật người chơi chọn
                if (this.playerCharacter === 'rabbit') {
                    // Người chơi là thỏ (X) → Bot dùng AIO.png
                    this.ui.setCharacterNames('Người chơi', 'Bot');
                    this.ui.setAvatars('assets/images/Tho.png', 'assets/images/AIO.png');
                } else {
                    // Người chơi là rùa (O) → Bot dùng AIX.png
                    this.ui.setCharacterNames('Người chơi', 'Bot');
                    this.ui.setAvatars('assets/images/rua.png', 'assets/images/AIX.png');
                }
                
                this.ui.showGameScreen();
                this.reset();
            });
        });

        // Buttons
        this.ui.elements.resetBtn.addEventListener('click', () => this.reset());
        this.ui.elements.playAgainBtn.addEventListener('click', () => {
            this.ui.hideResultModal();
            this.reset();
        });
        this.ui.elements.homeBtn.addEventListener('click', () => {
            this.timer.stop();
            this.gameActive = false;
            this.ui.showWelcomeScreen();
        });
        this.ui.elements.closeHelpBtn.addEventListener('click', () => this.ui.hideHelpModal());

        // Modal clicks
        this.ui.elements.resultModal.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.resultModal) {
                this.ui.hideResultModal();
                this.reset();
            }
        });
        this.ui.elements.helpModal.addEventListener('click', (e) => {
            if (e.target === this.ui.elements.helpModal) {
                this.ui.hideHelpModal();
            }
        });
    }

    handleCellClick(index) {
        if (!this.gameActive) return;

        // Trong PvP mode, cho phép cả 2 người chơi
        // Trong PvA mode, chặn khi đến lượt Bot hoặc bot đang suy nghĩ
        if (this.gameMode === 'pva' && (this.currentPlayer === PLAYER.BOT || this.botIsThinking)) {
            console.log('Chặn click: Bot đang suy nghĩ hoặc đến lượt bot');
            return;
        }

        // Bắt đầu đếm giờ khi người chơi đánh nước đầu tiên
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.timer.start();
        }

        if (this.gamePhase === GAME_PHASE.PLACEMENT) {
            this.handlePlacementClick(index);
        } else {
            this.handleMovementClick(index);
        }
    }

    handlePlacementClick(index) {
        if (this.gameState[index] !== '') return;
        
        // Kiểm tra người chơi đã đặt đủ 3 quân chưa
        if (this.currentPlayer === PLAYER.HUMAN && this.piecesPlaced[PLAYER.HUMAN] >= GAME_CONFIG.MAX_PIECES) {
            console.log('Người chơi đã đặt đủ 3 quân');
            return;
        }
        if (this.currentPlayer === PLAYER.BOT && this.piecesPlaced[PLAYER.BOT] >= GAME_CONFIG.MAX_PIECES) {
            console.log('Bot đã đặt đủ 3 quân');
            return;
        }
        
        this.placePiece(index, this.currentPlayer);
        if (!this.checkWin()) {
            this.switchPlayer();
        }
    }

    handleMovementClick(index) {
        if (this.selectedPiece === null) {
            // Chọn quân để di chuyển
            if (this.gameState[index] === this.currentPlayer) {
                this.selectPiece(index);
            }
        } else {
            // Di chuyển quân đã chọn
            if (this.gameState[index] === '' && index !== this.selectedPiece) {
                this.movePiece(this.selectedPiece, index);
                if (!this.checkWin()) {
                    this.switchPlayer();
                }
            } else if (this.gameState[index] === this.currentPlayer) {
                // Chọn quân khác
                this.selectPiece(index);
            }
        }
    }

    placePiece(index, player) {
        this.gameState[index] = player;
        this.ui.updateCell(index, player);
        this.piecesPlaced[player]++;
        this.ui.updatePieces(this.piecesPlaced);
        this.updatePhaseDisplay();
    }

    selectPiece(index) {
        this.selectedPiece = index;
        this.ui.selectCell(index);
        this.ui.updateInstruction('Nhấp vào ô trống để di chuyển quân');
    }

    movePiece(fromIndex, toIndex) {
        const player = this.gameState[fromIndex];
        this.gameState[fromIndex] = '';
        this.gameState[toIndex] = player;
        
        this.ui.clearCell(fromIndex);
        this.ui.updateCell(toIndex, player);
        
        this.selectedPiece = null;
        this.updatePhaseDisplay();
    }

    switchPlayer() {
        this.timer.pause(this.currentPlayer);
        
        // Clear timeout cũ nếu có
        if (this.botMoveTimeout) {
            clearTimeout(this.botMoveTimeout);
            this.botMoveTimeout = null;
        }
        
        this.currentPlayer = this.currentPlayer === PLAYER.HUMAN ? PLAYER.BOT : PLAYER.HUMAN;
        this.timer.setCurrentPlayer(this.currentPlayer);
        
        // Cập nhật thinking indicator
        this.ui.setThinking(this.currentPlayer);
        
        // Cập nhật status dựa trên game mode
        let playerName;
        if (this.gameMode === 'pvp') {
            playerName = this.currentPlayer === PLAYER.HUMAN ? 'Người chơi 1' : 'Người chơi 2';
        } else {
            playerName = this.currentPlayer === PLAYER.HUMAN ? 'Người chơi' : 'Bot';
        }
        this.ui.updateStatus(`Lượt của: ${this.currentPlayer} (${playerName})`);
        
        if (this.gamePhase === GAME_PHASE.MOVEMENT && this.currentPlayer === PLAYER.HUMAN) {
            this.ui.updateInstruction('Chọn quân X của bạn để di chuyển');
        }
        
        if (this.gamePhase === GAME_PHASE.MOVEMENT && this.currentPlayer === PLAYER.BOT && this.gameMode === 'pvp') {
            this.ui.updateInstruction('Chọn quân O của bạn để di chuyển');
        }
        
        this.timer.resume();
        
        // Nếu là PvA mode và lượt bot, trigger bot move
        if (this.gameMode === 'pva' && this.currentPlayer === PLAYER.BOT && this.gameActive) {
            this.triggerBotMove();
        } else if (this.currentPlayer === PLAYER.HUMAN || this.gameMode === 'pvp') {
            // Khi chuyển về lượt người chơi hoặc PvP mode, đảm bảo mở khóa
            this.botIsThinking = false;
            console.log('Lượt người chơi, mở khóa input');
        }
    }

    triggerBotMove() {
        this.botIsThinking = true;
        console.log('Bot bắt đầu suy nghĩ, khóa input người chơi');

        const thinkTime = GAME_CONFIG.BOT_THINK_TIME[this.bot.difficulty];

        setTimeout(() => {
            this.executeBotMove();
        }, thinkTime);

        // Timeout bảo vệ
        this.botMoveTimeout = setTimeout(() => {
            if (this.currentPlayer === PLAYER.BOT && this.gameActive && this.botIsThinking) {
                console.warn('Bot timeout! Force bot move...');
                this.forceBotMove();
            }
        }, GAME_CONFIG.BOT_TIMEOUT);
    }

    executeBotMove() {
        try {
            if (!this.gameActive || this.currentPlayer !== PLAYER.BOT) {
                console.log('Bot bỏ qua: game không active hoặc không phải lượt bot');
                this.botIsThinking = false;
                return;
            }

            console.log('Bot thực hiện nước đi... Giai đoạn:', this.gamePhase);

            const move = this.bot.getMove(this.gameState, this.gamePhase, this.piecesPlaced);
            console.log('Bot tìm được nước đi:', move);
            console.log('Trạng thái: piecesPlaced =', this.piecesPlaced, 'gamePhase =', this.gamePhase);

            if (move) {
                if (this.gamePhase === GAME_PHASE.PLACEMENT) {
                    this.placePiece(move, PLAYER.BOT);
                } else {
                    this.movePiece(move.from, move.to);
                }
                
                this.botIsThinking = false;
                
                if (!this.checkWin()) {
                    this.switchPlayer();
                }
            } else {
                console.error('Bot không tìm thấy nước đi');
                console.log('Kiểm tra: piecesPlaced.O =', this.piecesPlaced.O, 'piecesPlaced.X =', this.piecesPlaced.X);
                
                // Nếu cả 2 đã đặt đủ 3 quân, chuyển sang giai đoạn 2 và gọi lại bot
                if (this.gamePhase === GAME_PHASE.PLACEMENT && 
                    this.piecesPlaced[PLAYER.HUMAN] >= GAME_CONFIG.MAX_PIECES && 
                    this.piecesPlaced[PLAYER.BOT] >= GAME_CONFIG.MAX_PIECES) {
                    console.log('Chuyển sang giai đoạn 2 và gọi lại bot');
                    this.gamePhase = GAME_PHASE.MOVEMENT;
                    this.ui.updatePhase('Giai đoạn 2: Di chuyển quân');
                    this.ui.updateInstruction('Chọn quân X của bạn để di chuyển');
                    this.ui.showPhaseNotification();
                    this.botIsThinking = false;
                    
                    // Gọi đệ quy để bot thử lại với giai đoạn 2
                    this.triggerBotMove();
                    return;
                }
                
                // Nếu không phải trường hợp trên, thử fallback
                console.error('Thử fallback...');
                this.forceBotMove();
            }
        } catch (error) {
            console.error('Lỗi trong executeBotMove:', error);
            // Gọi fallback khi có 
                // Thử fallback
                console.error('Thử fallback...');
                this.forceBotMove();
            }
        } catch (error) {
            console.error('Lỗi trong executeBotMove:', error);
            this.forceBotMove();
        }
    }

    forceBotMove() {
        try {
            const fallbackMove = this.bot.getFallbackMove(this.gameState, this.gamePhase);
            if (fallbackMove) {
                console.log('Bot dùng fallback:', fallbackMove);
                if (this.gamePhase === GAME_PHASE.PLACEMENT) {
                    this.placePiece(fallbackMove, PLAYER.BOT);
                } else {
                    this.movePiece(fallbackMove.from, fallbackMove.to);
                }
                
                this.botIsThinking = false;
                
                if (!this.checkWin()) {
                    this.switchPlayer();
                }
            } else {
                console.error('Bot không thể đi, chuyển lượt');
                this.botIsThinking = false;
                this.switchPlayer();
            }
        } catch (e) {
            console.error('Lỗi fallback:', e);
            this.botIsThinking = false;
            this.switchPlayer();
        }
    }

    updatePhaseDisplay() {
        if (this.gamePhase === GAME_PHASE.PLACEMENT) {
            const totalPlaced = this.piecesPlaced[PLAYER.HUMAN] + this.piecesPlaced[PLAYER.BOT];
            this.ui.updatePhase(`Giai đoạn 1: Đặt quân (${totalPlaced}/6)`);
            
            if (this.piecesPlaced[PLAYER.HUMAN] >= GAME_CONFIG.MAX_PIECES && 
                this.piecesPlaced[PLAYER.BOT] >= GAME_CONFIG.MAX_PIECES) {
                this.gamePhase = GAME_PHASE.MOVEMENT;
                this.ui.updatePhase('Giai đoạn 2: Di chuyển quân');
                this.ui.updateInstruction('Chọn quân X của bạn để di chuyển');
                this.ui.showPhaseNotification();
            } else {
                this.ui.updateInstruction('Nhấp vào ô trống để đặt quân');
            }
        } else {
            this.ui.updatePhase('Giai đoạn 2: Di chuyển quân');
        }
    }

    checkWin() {
        for (let condition of WINNING_CONDITIONS) {
            const [a, b, c] = condition;
            if (this.gameState[a] && 
                this.gameState[a] === this.gameState[b] && 
                this.gameState[a] === this.gameState[c]) {
                
                let winnerName;
                if (this.gameMode === 'pvp') {
                    winnerName = this.gameState[a] === PLAYER.HUMAN ? 'Người chơi 1 (X)' : 'Người chơi 2 (O)';
                } else {
                    winnerName = this.gameState[a] === PLAYER.HUMAN ? 'Người chơi (X)' : 'Bot (O)';
                }
                
                this.endGame(`${winnerName} thắng!`);
                return true;
            }
        }
        return false;
    }

    handleTimeout(player) {
        let winner;
        if (this.gameMode === 'pvp') {
            winner = player === PLAYER.HUMAN ? 'Người chơi 2 (O)' : 'Người chơi 1 (X)';
        } else {
            winner = player === PLAYER.HUMAN ? 'Bot (O)' : 'Người chơi (X)';
        }
        this.endGame(`${winner} thắng! (Hết giờ)`);
    }

    endGame(message) {
        this.gameActive = false;
        this.ui.clearThinking(); // Xóa thinking indicator
        this.ui.updateStatus(message);
        this.ui.updateInstruction('Nhấn "Chơi lại" để bắt đầu ván mới');
        this.timer.stop();
        this.ui.clearAllCells();
        
        // Vẽ lại bàn cờ
        this.gameState.forEach((player, index) => {
            if (player) this.ui.updateCell(index, player);
        });
        
        this.ui.showResultModal(message);
    }
}
