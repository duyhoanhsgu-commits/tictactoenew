// UI Management
export class UI {
    constructor() {
        this.elements = {
            welcomeScreen: document.getElementById('welcomeScreen'),
            startBtn: document.getElementById('startBtn'),
            welcomeHelpBtn: document.getElementById('welcomeHelpBtn'),
            gameModeScreen: document.getElementById('gameModeScreen'),
            pvpMode: document.getElementById('pvpMode'),
            pvaMode: document.getElementById('pvaMode'),
            backToWelcomeBtn: document.getElementById('backToWelcomeBtn'),
            characterSelectScreen: document.getElementById('characterSelectScreen'),
            selectRabbit: document.getElementById('selectRabbit'),
            selectTurtle: document.getElementById('selectTurtle'),
            backToModeBtn: document.getElementById('backToModeBtn'),
            leftPanel: document.getElementById('leftPanel'),
            rightPanel: document.getElementById('rightPanel'),
            avatarLeft: document.getElementById('avatarLeft'),
            avatarRight: document.getElementById('avatarRight'),
            nameLeft: document.getElementById('nameLeft'),
            nameRight: document.getElementById('nameRight'),
            timerLeft: document.getElementById('timerLeft'),
            timerRight: document.getElementById('timerRight'),
            piecesLeft: document.getElementById('piecesLeft'),
            piecesRight: document.getElementById('piecesRight'),
            thinkingLeft: document.getElementById('thinkingLeft'),
            thinkingRight: document.getElementById('thinkingRight'),
            board: document.getElementById('board'),
            cells: document.querySelectorAll('.cell'),
            status: document.getElementById('status'),
            phase: document.getElementById('phase'),
            instruction: document.getElementById('instruction'),
            resetBtn: document.getElementById('resetBtn'),
            resultModal: document.getElementById('resultModal'),
            resultTitle: document.getElementById('resultTitle'),
            resultMessage: document.getElementById('resultMessage'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            helpModal: document.getElementById('helpModal'),
            closeHelpBtn: document.getElementById('closeHelpBtn'),
            difficultyScreen: document.getElementById('difficultyScreen'),
            gameScreen: document.getElementById('gameScreen'),
            difficultyCards: document.querySelectorAll('.difficulty-card'),
            homeBtn: document.getElementById('homeBtn'),
            currentDifficultyText: document.getElementById('currentDifficultyText')
        };
    }

    showCharacterSelectScreen() {
        this.elements.welcomeScreen.classList.add('hidden');
        this.elements.gameModeScreen.classList.add('hidden');
        this.elements.characterSelectScreen.classList.remove('hidden');
        this.elements.difficultyScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
    }

    hideCharacterSelectScreen() {
        this.elements.characterSelectScreen.classList.add('hidden');
    }

    setCharacterNames(leftName, rightName) {
        this.elements.nameLeft.textContent = leftName;
        this.elements.nameRight.textContent = rightName;
    }

    setAvatars(leftAvatar, rightAvatar) {
        this.elements.avatarLeft.src = leftAvatar;
        this.elements.avatarRight.src = rightAvatar;
    }

    setThinking(player) {
        // Remove all active states
        this.elements.thinkingLeft.classList.remove('active');
        this.elements.thinkingRight.classList.remove('active');
        this.elements.leftPanel.classList.remove('active');
        this.elements.rightPanel.classList.remove('active');
        
        // Add active state to current player
        if (player === 'X') {
            this.elements.thinkingLeft.classList.add('active');
            this.elements.leftPanel.classList.add('active');
        } else {
            this.elements.thinkingRight.classList.add('active');
            this.elements.rightPanel.classList.add('active');
        }
    }

    clearThinking() {
        this.elements.thinkingLeft.classList.remove('active');
        this.elements.thinkingRight.classList.remove('active');
        this.elements.leftPanel.classList.remove('active');
        this.elements.rightPanel.classList.remove('active');
    }

    updateTimer(timeLeft) {
        const xMinutes = Math.floor(timeLeft.X / 60);
        const xSeconds = timeLeft.X % 60;
        const oMinutes = Math.floor(timeLeft.O / 60);
        const oSeconds = timeLeft.O % 60;
        
        this.elements.timerLeft.textContent = `${xMinutes}:${xSeconds.toString().padStart(2, '0')}`;
        this.elements.timerRight.textContent = `${oMinutes}:${oSeconds.toString().padStart(2, '0')}`;
    }

    updatePieces(piecesPlaced) {
        this.elements.piecesLeft.textContent = `${piecesPlaced.X}/3`;
        this.elements.piecesRight.textContent = `${piecesPlaced.O}/3`;
    }

    showWelcomeScreen() {
        this.elements.welcomeScreen.classList.remove('hidden');
        this.elements.gameModeScreen.classList.add('hidden');
        this.elements.difficultyScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
    }

    hideWelcomeScreen() {
        this.elements.welcomeScreen.classList.add('hidden');
    }

    showGameModeScreen() {
        this.elements.welcomeScreen.classList.add('hidden');
        this.elements.gameModeScreen.classList.remove('hidden');
        this.elements.difficultyScreen.classList.add('hidden');
        this.elements.gameScreen.classList.add('hidden');
    }

    hideGameModeScreen() {
        this.elements.gameModeScreen.classList.add('hidden');
    }

    updateStatus(text) {
        this.elements.status.textContent = text;
    }

    updatePhase(text) {
        this.elements.phase.textContent = text;
    }

    updateInstruction(text) {
        this.elements.instruction.textContent = text;
    }

    updateCell(index, player) {
        const cell = this.elements.cells[index];
        cell.textContent = player;
        if (player) {
            cell.classList.add(player.toLowerCase());
        } else {
            cell.classList.remove('x', 'o', 'selected');
        }
    }

    clearCell(index) {
        const cell = this.elements.cells[index];
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'selected');
    }

    selectCell(index) {
        this.elements.cells.forEach(cell => cell.classList.remove('selected'));
        this.elements.cells[index].classList.add('selected');
    }

    clearAllCells() {
        this.elements.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'selected');
        });
    }

    showResultModal(message) {
        // Kiểm tra ai thắng dựa trên message
        if (message.includes('thắng')) {
            if (message.includes('Người chơi 1') || 
                message.includes('Người chơi (X)') || 
                (message.includes('Người chơi') && message.includes('(X)'))) {
                // Người chơi 1 / Người chơi X thắng
                this.elements.resultTitle.textContent = '🎉 Chiến thắng!';
                this.elements.resultTitle.style.color = '#667eea';
            } else if (message.includes('Bot') || 
                       message.includes('Người chơi 2') || 
                       message.includes('(O)')) {
                // Bot hoặc Người chơi 2 thắng
                if (message.includes('Bot')) {
                    this.elements.resultTitle.textContent = '😔 Thua cuộc!';
                    this.elements.resultTitle.style.color = '#e74c3c';
                } else {
                    this.elements.resultTitle.textContent = '🎉 Người chơi 2 thắng!';
                    this.elements.resultTitle.style.color = '#764ba2';
                }
            } else {
                this.elements.resultTitle.textContent = '🎉 Chiến thắng!';
                this.elements.resultTitle.style.color = '#667eea';
            }
        } else {
            this.elements.resultTitle.textContent = '🤝 Hòa!';
            this.elements.resultTitle.style.color = '#f39c12';
        }
        
        this.elements.resultMessage.textContent = message;
        this.elements.resultModal.classList.add('show');
    }

    hideResultModal() {
        this.elements.resultModal.classList.remove('show');
    }

    showHelpModal() {
        this.elements.helpModal.classList.add('show');
    }

    hideHelpModal() {
        this.elements.helpModal.classList.remove('show');
    }

    showPhaseNotification() {
        const notification = document.createElement('div');
        notification.className = 'phase-notification';
        notification.innerHTML = '<h3>🎯 Giai đoạn 2</h3><p>Bắt đầu di chuyển quân!</p>';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 1000);
    }

    showDifficultyScreen() {
        this.elements.gameScreen.classList.add('hidden');
        this.elements.difficultyScreen.classList.remove('hidden');
    }

    showGameScreen() {
        this.elements.difficultyScreen.classList.add('hidden');
        this.elements.gameScreen.classList.remove('hidden');
    }

    setDifficultyText(difficultyName) {
        this.elements.currentDifficultyText.textContent = difficultyName;
    }
}
