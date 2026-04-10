// Timer management
import { GAME_CONFIG, PLAYER } from './constants.js';

export class Timer {
    constructor(updateCallback, timeoutCallback) {
        this.timeLeft = { 
            [PLAYER.HUMAN]: GAME_CONFIG.PLAYER_TIME, 
            [PLAYER.BOT]: GAME_CONFIG.PLAYER_TIME 
        };
        this.timerInterval = null;
        this.turnStartTime = null;
        this.updateCallback = updateCallback;
        this.timeoutCallback = timeoutCallback;
        this.gameMode = 'pva'; // Default mode
    }

    setGameMode(mode) {
        this.gameMode = mode;
    }

    start() {
        if (this.timerInterval) return;
        
        this.turnStartTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.tick();
        }, 100);
    }

    tick() {
        const currentPlayer = this.getCurrentPlayer();
        
        // Đếm giờ cho tất cả người chơi
        const elapsed = Math.floor((Date.now() - this.turnStartTime) / 1000);
        if (elapsed > 0) {
            this.timeLeft[currentPlayer] = Math.max(0, this.timeLeft[currentPlayer] - elapsed);
            this.turnStartTime = Date.now();
            this.updateCallback(this.timeLeft);
            
            if (this.timeLeft[currentPlayer] <= 0) {
                this.stop();
                this.timeoutCallback(currentPlayer);
            }
        }
    }

    pause(currentPlayer) {
        // Cập nhật thời gian trước khi tạm dừng cho tất cả người chơi
        if (this.turnStartTime) {
            const elapsed = Math.floor((Date.now() - this.turnStartTime) / 1000);
            this.timeLeft[currentPlayer] = Math.max(0, this.timeLeft[currentPlayer] - elapsed);
            this.updateCallback(this.timeLeft);
        }
    }

    resume() {
        // Bắt đầu đếm cho người chơi mới
        this.turnStartTime = Date.now();
    }

    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    reset() {
        this.stop();
        this.timeLeft = { 
            [PLAYER.HUMAN]: GAME_CONFIG.PLAYER_TIME, 
            [PLAYER.BOT]: GAME_CONFIG.PLAYER_TIME 
        };
        this.turnStartTime = null;
    }

    getCurrentPlayer() {
        // This will be set by the game instance
        return this._currentPlayer;
    }

    setCurrentPlayer(player) {
        this._currentPlayer = player;
    }
}
