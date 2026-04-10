# Cấu trúc Code - Game Caro 3 Quân

## 📁 Tổ chức File

```
js/
├── main.js          # Entry point - Khởi tạo game
├── constants.js     # Hằng số và cấu hình
├── game.js          # Logic game chính
├── bot.js           # AI Bot (Easy, Medium, Hard)
├── timer.js         # Quản lý thời gian
├── ui.js            # Quản lý giao diện
└── main-old.js      # File cũ (backup)
```

## 📝 Mô tả từng file

### 1. `constants.js`
- Định nghĩa các hằng số: WINNING_CONDITIONS, GAME_CONFIG, PLAYER, GAME_PHASE
- Cấu hình thời gian, số quân, độ khó

### 2. `timer.js`
- Class Timer quản lý đếm ngược thời gian
- Chỉ đếm giờ cho người chơi (X), không đếm cho bot (O)
- Methods: start(), stop(), pause(), resume(), reset()

### 3. `ui.js`
- Class UI quản lý tất cả tương tác giao diện
- Cập nhật status, phase, timer, cells
- Hiển thị modal, notification
- Methods: updateStatus(), updateCell(), showResultModal(), etc.

### 4. `bot.js`
- Class Bot chứa toàn bộ AI logic
- 3 mức độ: Easy, Medium, Hard
- Minimax algorithm cho Hard mode
- Methods: getMove(), getMoveEasy(), getMoveMedium(), getMoveHard()

### 5. `game.js`
- Class Game - Logic game chính
- Quản lý trạng thái game, lượt chơi, kiểm tra thắng
- Xử lý sự kiện click, chuyển lượt, đặt quân, di chuyển
- Tích hợp Timer, Bot, UI

### 6. `main.js`
- Entry point của ứng dụng
- Khởi tạo Game instance khi DOM ready
- Export game instance ra window để debug

## 🔄 Luồng hoạt động

1. **Khởi động**: `main.js` → Tạo `Game` instance
2. **Game khởi tạo**: Tạo `UI`, `Bot`, `Timer`
3. **Người chơi click**: `handleCellClick()` → `placePiece()` / `movePiece()`
4. **Chuyển lượt**: `switchPlayer()` → Trigger `triggerBotMove()`
5. **Bot suy nghĩ**: `executeBotMove()` → `bot.getMove()` → `placePiece()` / `movePiece()`
6. **Kiểm tra thắng**: `checkWin()` → `endGame()`

## 🎯 Ưu điểm cấu trúc mới

✅ **Tách biệt rõ ràng**: Mỗi file có trách nhiệm riêng
✅ **Dễ maintain**: Sửa bot chỉ cần sửa bot.js
✅ **Dễ test**: Có thể test từng module độc lập
✅ **Dễ mở rộng**: Thêm tính năng mới không ảnh hưởng code cũ
✅ **ES6 Modules**: Import/export chuẩn, không global variables

## 🚀 Chạy game

1. Mở `index.html` trong trình duyệt
2. Hoặc dùng live server (vì dùng ES6 modules)

## 🐛 Debug

Mở Console (F12) và gõ:
```javascript
window.game          // Xem game instance
window.game.gameState    // Xem trạng thái bàn cờ
window.game.bot.difficulty  // Xem độ khó hiện tại
```

## 📦 File backup

- `main-old.js`: File gốc (monolithic) để tham khảo
