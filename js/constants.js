// Constants và cấu hình game
export const WINNING_CONDITIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Hàng ngang
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Hàng dọc
    [0, 4, 8], [2, 4, 6]             // Đường chéo
];

export const GAME_CONFIG = {
    PLAYER_TIME: 30,        // Thời gian mỗi người chơi (giây)
    MAX_PIECES: 3,          // Số quân tối đa mỗi người
    TOTAL_CELLS: 9,         // Tổng số ô
    BOT_THINK_TIME: {
        easy: 500,
        medium: 1000,
        hard: 1500
    },
    BOT_TIMEOUT: 5000       // Timeout bảo vệ cho bot (ms)
};

export const DIFFICULTY_NAMES = {
    easy: 'Dễ',
    medium: 'Trung bình',
    hard: 'Khó'
};

export const PLAYER = {
    HUMAN: 'X',
    BOT: 'O'
};

export const GAME_PHASE = {
    PLACEMENT: 1,
    MOVEMENT: 2
};
