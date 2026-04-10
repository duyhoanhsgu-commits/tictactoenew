# 🎮 Tic Tac Toe - Game Cờ Caro 3x3

Game Tic Tac Toe (Cờ Caro 3x3) với AI thông minh, giao diện đẹp mắt và nhiều chế độ chơi.

## ✨ Tính năng

### 🎯 Chế độ chơi
- **PvP (Player vs Player)**: Chơi với bạn bè trên cùng một thiết bị
- **PvA (Player vs AI)**: Thách đấu với AI thông minh

### 🤖 AI Bot với 3 cấp độ
- **Easy**: Dễ dàng - Bot đánh ngẫu nhiên, ít khi chặn (20% cơ hội)
- **Medium**: Trung bình - Bot luôn chặn và tìm nước đi tốt nhất
- **Hard**: Khó - Bot sử dụng thuật toán Minimax, ưu tiên ô giữa và góc

### 🎨 Giao diện
- Thiết kế hiện đại, responsive
- Hiệu ứng animation mượt mà
- Hỗ trợ đầy đủ trên mobile và desktop
- Chọn nhân vật (Thỏ hoặc Rùa)

### ⏱️ Hệ thống thời gian
- Đếm ngược thời gian cho mỗi lượt (30 giây)
- Tự động chuyển lượt khi hết giờ
- Hiển thị thời gian còn lại

### 🎲 Luật chơi đặc biệt
**Giai đoạn 1 - Đặt quân (0/6)**:
- Mỗi người chơi đặt lần lượt 3 quân cờ lên bàn cờ 3x3
- Người chơi 1 (X) đi trước, người chơi 2 (O) đi sau

**Giai đoạn 2 - Di chuyển quân**:
- Sau khi cả 2 đã đặt đủ 3 quân, chuyển sang giai đoạn di chuyển
- Mỗi lượt chọn 1 quân của mình và di chuyển đến ô trống
- Người nào tạo được 3 quân liên tiếp (ngang/dọc/chéo) sẽ thắng

## 🚀 Cài đặt và chạy

### Yêu cầu
- Trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- Không cần cài đặt thêm

### Chạy local
1. Clone repository:
```bash
git clone <repository-url>
cd tic-tac-toe
```

2. Mở file `index.html` bằng trình duyệt:
```bash
# Hoặc dùng Live Server nếu có
# Hoặc mở trực tiếp file index.html
```

3. Bắt đầu chơi!

## 📁 Cấu trúc project

```
tic-tac-toe/
├── index.html          # File HTML chính
├── css/
│   └── style.css       # Stylesheet
├── js/
│   ├── main.js         # Entry point
│   ├── game.js         # Logic game chính
│   ├── bot.js          # AI Bot logic
│   ├── ui.js           # Quản lý giao diện
│   ├── timer.js        # Hệ thống đếm giờ
│   └── constants.js    # Hằng số và cấu hình
├── assets/
│   └── images/         # Hình ảnh nhân vật
└── README.md
```

## 🎮 Hướng dẫn chơi

1. **Chọn chế độ chơi**: PvP hoặc PvA
2. **Chọn nhân vật** (nếu chơi với AI): Thỏ (X) hoặc Rùa (O)
3. **Chọn độ khó** (nếu chơi với AI): Easy, Medium, Hard
4. **Giai đoạn 1**: Đặt lần lượt 3 quân lên bàn cờ
5. **Giai đoạn 2**: Di chuyển quân để tạo 3 quân liên tiếp
6. **Chiến thắng**: Người tạo được 3 quân liên tiếp sẽ thắng

## 🛠️ Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Styling và animation
- **JavaScript (ES6+)**: Logic game và AI
- **Module Pattern**: Tổ chức code rõ ràng

## 🤖 Thuật toán AI

### Easy Mode
- Đặt quân ngẫu nhiên
- 20% cơ hội chặn đối thủ
- 30% cơ hội thắng nếu có thể
- 40% cơ hội chặn ở giai đoạn 2

### Medium Mode
- Luôn ưu tiên thắng ngay nếu có thể
- Luôn chặn đối thủ nếu họ sắp thắng
- Đánh giá và chọn nước đi tốt nhất

### Hard Mode
- Sử dụng thuật toán Minimax với Alpha-Beta Pruning
- Ưu tiên ô giữa và góc ở giai đoạn đặt quân
- Tính toán trước nhiều nước đi
- Khó thắng nhất

## 📝 License

MIT License - Tự do sử dụng và chỉnh sửa

## 👨‍💻 Tác giả

Phát triển bởi [Tên của bạn]

---

**Chúc bạn chơi game vui vẻ! 🎉**
