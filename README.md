# WebRTC-Based Real-Time Communication System
> **Đồ án cuối kỳ - Môn học: Lập trình mạng**
> **Nhóm: 05 | Đề tài: Hệ thống truyền thông thời gian thực P2P**

## 🌐 Giới thiệu
Dự án xây dựng một nền tảng hội nghị trực tuyến dựa trên giao thức **WebRTC (Web Real-Time Communication)**, cho phép kết nối ngang hàng (Peer-to-Peer) trực tiếp giữa các trình duyệt. Hệ thống tối ưu hóa băng thông bằng cách truyền dữ liệu Media và Data trực tiếp mà không thông qua server trung gian sau khi đã thiết lập xong kết nối (Signaling).

## ✨ Tính năng nổi bật
*   **Video/Audio Call:** Truyền tải hình ảnh và âm thanh độ trễ thấp.
*   **Spotlight Mode (Pinning):** Khả năng ghim video tiêu điểm (Focus mode) tương tự Google Meet/Teams.
*   **P2P Chat:** Nhắn tin thời gian thực tích hợp **Timestamp** (giờ gửi) qua DataChannel.
*   **P2P File Handshake:** Hệ thống gửi file an toàn với cơ chế bắt tay (Offer/Accept), cho phép theo dõi tiến trình (Progress Bar) và lưu file thủ công.
*   **Screen Sharing:** Chia sẻ màn hình chất lượng cao trực tiếp trong cuộc gọi.
*   **Recording:** Ghi lại cuộc hội thoại và xuất file định dạng `.webm`.
*   **Modern UI/UX:** Giao diện **Minimalist Studio** sang trọng, hỗ trợ Responsive trên nhiều thiết bị.

## 🛠 Công nghệ sử dụng
*   **Frontend:** React.js, Vite, CSS3 (Modern Glassmorphism).
*   **Backend (Signaling Server):** Node.js, Socket.io.
*   **WebRTC Core:** RTCPeerConnection, RTCDataChannel, MediaStream API.

## 🚀 Hướng dẫn cài đặt và khởi chạy

### 1. Yêu cầu hệ thống
*   Node.js (phiên bản 16.x trở lên)
*   NPM hoặc Yarn

### 2. Cài đặt các phụ thuộc
Mở 2 cửa sổ terminal cho Client và Server:

**Cho Server:**
```bash
cd server
npm install
```

**Cho Client:**
```bash
cd client
npm install
```

### 3. Chạy ứng dụng
**Cho Server:**
```bash
cd server
npm start
```
*Server sẽ chạy tại: `http://localhost:8000`*

**Cho Client:**
```bash
cd client
npm run dev
```
*Truy cập ứng dụng tại: `http://localhost:5173`*

---

## 🌍 Hướng dẫn Deploy (Render)

Dự án đã được cấu hình tương thích để deploy miễn phí trên [Render.com](https://render.com).

### Bước 1: Chuẩn bị
1. Fork dự án này về GitHub cá nhân của bạn.
2. Đăng ký tài khoản Render và kết nối với GitHub.

### Bước 2: Deploy Server (Back-end)
1. Tạo **Web Service** mới trên Render -> Chọn repo github.
2. Cấu hình:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Bấm Deploy. Sau khi xong, copy URL của Server (ví dụ: `https://my-webrtc.onrender.com`).

### Bước 3: Deploy Client (Front-end)
1. Tạo **Static Site** mới trên Render.
2. Cấu hình:
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Vào tab **Environment**, thêm biến môi trường:
   - Key: `VITE_SERVER_URL`
   - Value: `URL-Server-Của-Bạn` (Link copy ở bước 2)
4. Bấm **Create Static Site**.

---

## 📸 Hình ảnh Demo (Screenshots)

| Màn hình chờ (Lobby) | Màn hình gọi (Video Call) |
|:---:|:---:|
| <img src="./screenshots/lobby.png" width="400" alt="Lobby Screen" /> | <img src="./screenshots/room.png" width="400" alt="Room Screen" /> |

| Tính năng Chat & Gửi File | Chia sẻ màn hình |
|:---:|:---:|
| <img src="./screenshots/chat_file.png" width="400" alt="Chat & File" /> | <img src="./screenshots/share.png" width="400" alt="Screen Share" /> |

> *Lưu ý: Các hình ảnh trên được lưu trong thư mục `screenshots/` của dự án.*

---
© 2026 - Nhóm 05 - HCMC University of Technology and Education.

