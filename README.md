# Tic-tac-toe v-2 (Cờ ca-rô di chuyển)

Game Tic-tac-toe nâng cao với 2 giai đoạn chơi: đặt quân và di chuyển quân.

## Tính năng

- **2 Giai đoạn chơi:**
  - Giai đoạn 1: Mỗi người đặt 3 quân lên bàn cờ 3x3
  - Giai đoạn 2: Di chuyển quân đã đặt để tạo thành đường thẳng

- **Giới hạn thời gian:** Mỗi người chơi có 2 phút cho cả trận (tổng 4 phút)

- **3 Cấp độ khó:**
  - **Dễ:** Bot đi ngẫu nhiên, đôi khi chặn
  - **Trung bình:** Bot biết chặn và tấn công
  - **Khó:** Bot sử dụng thuật toán Minimax với Alpha-Beta Pruning

## Cấu trúc thư mục

```
TicTacToe/
├── index.html          # File HTML chính
├── css/
│   └── style.css       # Stylesheet
├── js/
│   └── main.js         # Logic game và AI
├── assets/
│   └── images/         # Hình ảnh (nếu có)
└── README.md           # Tài liệu
```

## Cách chạy

1. Mở terminal tại thư mục project
2. Chạy server:
   ```bash
   python3 -m http.server 8000
   ```
3. Mở trình duyệt và truy cập: `http://localhost:8000`

## Luật chơi

### Giai đoạn 1: Đặt quân
- Người chơi (X) và Bot (O) luân phiên đặt quân
- Mỗi bên đặt tối đa 3 quân

### Giai đoạn 2: Di chuyển quân
- Chọn quân của mình và di chuyển đến ô trống
- Mục tiêu: Tạo thành đường thẳng 3 quân (ngang/dọc/chéo)

### Điều kiện thắng
1. Tạo được đường thẳng 3 quân
2. Đối thủ hết thời gian (2 phút)

## Công nghệ

- HTML5
- CSS3 (Flexbox, Grid)
- Vanilla JavaScript
- Thuật toán Minimax với Alpha-Beta Pruning

## Tác giả

Game được phát triển cho mục đích giáo dục và rèn luyện tư duy logic.
