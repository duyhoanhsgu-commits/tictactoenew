// Bot AI Logic
import { WINNING_CONDITIONS, GAME_CONFIG, PLAYER, GAME_PHASE } from './constants.js';

export class Bot {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    getMove(gameState, gamePhase, piecesPlaced) {
        console.log('Bot suy nghĩ... Độ khó:', this.difficulty, 'Giai đoạn:', gamePhase);

        if (this.difficulty === 'easy') {
            return this.getMoveEasy(gameState, gamePhase, piecesPlaced);
        } else if (this.difficulty === 'medium') {
            return this.getMoveMedium(gameState, gamePhase, piecesPlaced);
        } else {
            return this.getMoveHard(gameState, gamePhase, piecesPlaced);
        }
    }

    getMoveEasy(gameState, gamePhase, piecesPlaced) {
        if (gamePhase === GAME_PHASE.PLACEMENT) {
            // Đặt quân ngẫu nhiên, rất ít khi chặn (20% cơ hội)
            if (Math.random() < 0.2) {
                const blockMove = this.findBlockingMove(gameState, PLAYER.HUMAN);
                if (blockMove !== null) return blockMove;
            }
            return this.getRandomEmptyCell(gameState);
        } else {
            // Giai đoạn 2: Di chuyển ngẫu nhiên
            const oPieces = this.getPieces(gameState, PLAYER.BOT);
            const emptyCells = this.getEmptyCells(gameState);
            
            if (oPieces.length === 0 || emptyCells.length === 0) {
                return this.getRandomMove(gameState, PLAYER.BOT);
            }
            
            // 30% cơ hội thắng nếu có thể
            if (Math.random() < 0.3) {
                for (let from of oPieces) {
                    for (let to of emptyCells) {
                        if (this.wouldWin(gameState, from, to, PLAYER.BOT)) {
                            return { from, to };
                        }
                    }
                }
            }
            
            // 40% cơ hội chặn
            if (Math.random() < 0.4) {
                const blockMove = this.findBlockingMovePhase2(gameState, PLAYER.HUMAN, oPieces, emptyCells);
                if (blockMove) return blockMove;
            }
            
            // Di chuyển ngẫu nhiên
            if (oPieces.length > 0 && emptyCells.length > 0) {
                const from = oPieces[Math.floor(Math.random() * oPieces.length)];
                const to = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                return { from, to };
            }
            
            return null;
        }
    }

    getMoveMedium(gameState, gamePhase, piecesPlaced) {
        if (gamePhase === GAME_PHASE.PLACEMENT) {
            // Ưu tiên: Thắng > Chặn > Ngẫu nhiên
            const winMove = this.findWinningMove(gameState, PLAYER.BOT);
            if (winMove !== null) return winMove;
            
            const blockMove = this.findBlockingMove(gameState, PLAYER.HUMAN);
            if (blockMove !== null) return blockMove;
            
            return this.getRandomEmptyCell(gameState);
        } else {
            const oPieces = this.getPieces(gameState, PLAYER.BOT);
            const emptyCells = this.getEmptyCells(gameState);
            
            if (oPieces.length === 0 || emptyCells.length === 0) {
                return this.getRandomMove(gameState, PLAYER.BOT);
            }
            
            // Ưu tiên 1: Thắng ngay
            for (let from of oPieces) {
                for (let to of emptyCells) {
                    if (this.wouldWin(gameState, from, to, PLAYER.BOT)) {
                        return { from, to };
                    }
                }
            }
            
            // Ưu tiên 2: Chặn người chơi
            const blockMove = this.findBlockingMovePhase2(gameState, PLAYER.HUMAN, oPieces, emptyCells);
            if (blockMove) return blockMove;
            
            // Ưu tiên 3: Nước đi tốt nhất
            let bestScore = -Infinity;
            let bestMove = null;
            
            for (let from of oPieces) {
                for (let to of emptyCells) {
                    const score = this.evaluateMove(gameState, from, to, PLAYER.BOT);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { from, to };
                    }
                }
            }
            
            return bestMove || this.getRandomMove(gameState, PLAYER.BOT);
        }
    }

    getMoveMedium(gameState, gamePhase, piecesPlaced) {
        if (gamePhase === GAME_PHASE.PLACEMENT) {
            // Ưu tiên: Thắng > Chặn > Ngẫu nhiên
            const winMove = this.findWinningMove(gameState, PLAYER.BOT);
            if (winMove !== null) return winMove;
            
            const blockMove = this.findBlockingMove(gameState, PLAYER.HUMAN);
            if (blockMove !== null) return blockMove;
            
            return this.getRandomEmptyCell(gameState);
        } else {
            const oPieces = this.getPieces(gameState, PLAYER.BOT);
            const emptyCells = this.getEmptyCells(gameState);
            
            if (oPieces.length === 0 || emptyCells.length === 0) {
                return this.getRandomMove(gameState, PLAYER.BOT);
            }
            
            // Ưu tiên 1: Thắng ngay
            for (let from of oPieces) {
                for (let to of emptyCells) {
                    if (this.wouldWin(gameState, from, to, PLAYER.BOT)) {
                        return { from, to };
                    }
                }
            }
            
            // Ưu tiên 2: Chặn người chơi
            const blockMove = this.findBlockingMovePhase2(gameState, PLAYER.HUMAN, oPieces, emptyCells);
            if (blockMove) return blockMove;
            
            // Ưu tiên 3: Nước đi tốt nhất
            let bestScore = -Infinity;
            let bestMove = null;
            
            for (let from of oPieces) {
                for (let to of emptyCells) {
                    const score = this.evaluateMove(gameState, from, to, PLAYER.BOT);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { from, to };
                    }
                }
            }
            
            return bestMove || this.getRandomMove(gameState, PLAYER.BOT);
        }
    }

    getMoveHard(gameState, gamePhase, piecesPlaced) {
        if (gamePhase === GAME_PHASE.PLACEMENT) {
            const winMove = this.findWinningMove(gameState, PLAYER.BOT);
            if (winMove !== null) return winMove;
            
            const blockMove = this.findBlockingMove(gameState, PLAYER.HUMAN);
            if (blockMove !== null) return blockMove;
            
            // Ưu tiên ô giữa và góc
            if (gameState[4] === '') return 4;
            const corners = [0, 2, 6, 8].filter(i => gameState[i] === '');
            if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
            
            return this.getRandomEmptyCell(gameState);
        } else {
            const oPieces = this.getPieces(gameState, PLAYER.BOT);
            const emptyCells = this.getEmptyCells(gameState);
            
            if (oPieces.length === 0 || emptyCells.length === 0) {
                return null;
            }
            
            // Ưu tiên 1: Thắng ngay
            for (let from of oPieces) {
                for (let to of emptyCells) {
                    if (this.wouldWin(gameState, from, to, PLAYER.BOT)) {
                        return { from, to };
                    }
                }
            }
            
            // Ưu tiên 2: Chặn
            const blockMove = this.findBlockingMovePhase2(gameState, PLAYER.HUMAN, oPieces, emptyCells);
            if (blockMove) return blockMove;
            
            // Ưu tiên 3: Minimax
            let bestScore = -Infinity;
            let bestMove = null;
            
            for (let from of oPieces) {
                for (let to of emptyCells) {
                    const score = this.minimax(gameState, from, to, 1, false, -Infinity, Infinity);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { from, to };
                    }
                }
            }
            
            if (!bestMove && oPieces.length > 0 && emptyCells.length > 0) {
                const from = oPieces[Math.floor(Math.random() * oPieces.length)];
                const to = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                return { from, to };
            }
            
            return bestMove;
        }
    }

    // Helper methods
    getPieces(gameState, player) {
        return gameState.map((val, idx) => val === player ? idx : null).filter(v => v !== null);
    }

    getEmptyCells(gameState) {
        return gameState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
    }

    getRandomEmptyCell(gameState) {
        const emptyCells = this.getEmptyCells(gameState);
        return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
    }

    getRandomMove(gameState, player) {
        const pieces = this.getPieces(gameState, player);
        if (pieces.length === 0) return null;
        
        const from = pieces[Math.floor(Math.random() * pieces.length)];
        const to = this.getRandomEmptyCell(gameState);
        return (to !== null && from !== undefined) ? { from, to } : null;
    }

    findWinningMove(gameState, player) {
        for (let i = 0; i < GAME_CONFIG.TOTAL_CELLS; i++) {
            if (gameState[i] === '') {
                gameState[i] = player;
                const isWin = this.checkWinForPlayer(gameState, player);
                gameState[i] = '';
                if (isWin) return i;
            }
        }
        return null;
    }

    findBlockingMove(gameState, opponent) {
        return this.findWinningMove(gameState, opponent);
    }

    findBlockingMovePhase2(gameState, opponent, oPieces, emptyCells) {
        const xPieces = this.getPieces(gameState, opponent);
        for (let xFrom of xPieces) {
            for (let xTo of emptyCells) {
                if (this.wouldWin(gameState, xFrom, xTo, opponent)) {
                    if (oPieces.length > 0) {
                        return { from: oPieces[0], to: xTo };
                    }
                }
            }
        }
        return null;
    }

    wouldWin(gameState, from, to, player) {
        const temp = [...gameState];
        temp[from] = '';
        temp[to] = player;
        const result = this.checkWinForPlayer(temp, player);
        return result;
    }

    checkWinForPlayer(gameState, player) {
        for (let condition of WINNING_CONDITIONS) {
            const [a, b, c] = condition;
            if (gameState[a] === player && gameState[b] === player && gameState[c] === player) {
                return true;
            }
        }
        return false;
    }

    evaluateMove(gameState, from, to, player) {
        const temp = [...gameState];
        temp[from] = '';
        temp[to] = player;
        return this.evaluatePosition(temp, player);
    }

    evaluatePosition(gameState, player) {
        let score = 0;
        const opponent = player === PLAYER.HUMAN ? PLAYER.BOT : PLAYER.HUMAN;
        
        for (let condition of WINNING_CONDITIONS) {
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

    minimax(gameState, from, to, depth, isMaximizing, alpha, beta) {
        const temp = [...gameState];
        temp[from] = '';
        temp[to] = isMaximizing ? PLAYER.HUMAN : PLAYER.BOT;
        
        if (this.checkWinForPlayer(temp, PLAYER.BOT)) return 100 - depth;
        if (this.checkWinForPlayer(temp, PLAYER.HUMAN)) return depth - 100;
        if (depth >= 3) return this.evaluatePosition(temp, PLAYER.BOT) - this.evaluatePosition(temp, PLAYER.HUMAN);
        
        const currentPlayer = isMaximizing ? PLAYER.BOT : PLAYER.HUMAN;
        const pieces = this.getPieces(temp, currentPlayer);
        const emptyCells = this.getEmptyCells(temp);
        
        if (emptyCells.length === 0 || pieces.length === 0) return 0;
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let pFrom of pieces) {
                for (let pTo of emptyCells) {
                    const score = this.minimax(temp, pFrom, pTo, depth + 1, false, alpha, beta);
                    maxScore = Math.max(maxScore, score);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let pFrom of pieces) {
                for (let pTo of emptyCells) {
                    const score = this.minimax(temp, pFrom, pTo, depth + 1, true, alpha, beta);
                    minScore = Math.min(minScore, score);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    getFallbackMove(gameState, gamePhase) {
        if (gamePhase === GAME_PHASE.PLACEMENT) {
            for (let i = 0; i < GAME_CONFIG.TOTAL_CELLS; i++) {
                if (gameState[i] === '') return i;
            }
            return null;
        } else {
            let oIndex = -1;
            let emptyIndex = -1;
            
            for (let i = 0; i < GAME_CONFIG.TOTAL_CELLS; i++) {
                if (gameState[i] === PLAYER.BOT && oIndex === -1) oIndex = i;
                if (gameState[i] === '' && emptyIndex === -1) emptyIndex = i;
                if (oIndex !== -1 && emptyIndex !== -1) break;
            }
            
            if (oIndex !== -1 && emptyIndex !== -1) {
                return { from: oIndex, to: emptyIndex };
            }
            return null;
        }
    }
}
