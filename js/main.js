// Entry point - Khởi tạo game
import { Game } from './game.js';

// Khởi tạo game khi DOM đã load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Game Caro 3 Quân khởi động...');
    const game = new Game();
    console.log('✅ Game đã sẵn sàng!');
    
    // Expose game instance for debugging
    window.game = game;
});
