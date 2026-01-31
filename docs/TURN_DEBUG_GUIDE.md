# 🔥 Hướng dẫn Debug TURN Server

## ⚠️ Vấn đề: "Tại sao TURN không hoạt động?"

TURN (Traversal Using Relays around NAT) là cần thiết khi 2 users ở mạng khác nhau (WAN) không thể kết nối trực tiếp.

---

## 📋 CHECKLIST KIỂM TRA

### 1️⃣ **Mở Browser Console và kiểm tra logs**

Khi bạn vào phòng và kết nối với user khác, bạn cần thấy:

✅ **Điều này là TốT:**
```
🧊 ICE Candidate found: {type: "relay", protocol: "udp", relay: "YES (USING TURN)"}
🧊 ICE Connection State: connected
```

❌ **Điều này là XẤU:**
```
🧊 ICE Candidate found: {type: "host", relay: "NO"}
🧊 ICE Candidate found: {type: "srflx", relay: "NO"}
🧊 ICE Connection State: failed
```

Nếu bạn **KHÔNG** thấy `type: "relay"` sau 5-10 giây, TURN servers bị block hoặc không hoạt động!

---

### 2️⃣ **Test TURN servers thủ công**

#### **Cách 1: Dùng file test-turn.html**

1. Mở file `test-turn.html` trong browser
2. Click "🚀 Bắt đầu Test"
3. Đợi 10 giây
4. Kiểm tra kết quả:
   - ✅ **Nếu thấy "🔥 TURN Relay Candidates" > 0** → TURN OK!
   - ❌ **Nếu = 0** → TURN bị chặn

#### **Cách 2: Test online**
Trang web: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

1. Thêm TURN server vào (ví dụ):
   ```
   turn:openrelay.metered.ca:80
   username: openrelayproject
   password: openrelayproject
   ```
2. Click "Gather candidates"
3. Xem có `typ relay` không

---

### 3️⃣ **Các lý do phổ biến TURN không hoạt động**

| Vấn đề | Giải pháp |
|--------|-----------|
| 🔒 **Firewall chặn UDP/TCP ports** | Sử dụng TURN qua port 443 (HTTPS) |
| 🚫 **TURN server miễn phí hết quota** | Thử server khác hoặc tự host TURN |
| ⚠️ **Credentials sai** | Kiểm tra username/password |
| 🌐 **Network enterprise block TURN** | Dùng VPN hoặc đổi mạng |
| 🔧 **Không dùng `iceTransportPolicy: 'all'`** | Đảm bảo config đúng |

---

### 4️⃣ **Deploy lên server thực tế**

Nếu bạn đang deploy lên **Render/Vercel/Railway**, đảm bảo:

#### **Client (.env)**
```env
VITE_SERVER_URL=https://your-server.onrender.com  # Phải là HTTPS!
```

#### **Server (CORS)**
```javascript
cors: {
  origin: "*",  // Hoặc domain cụ thể
  credentials: true
}
```

#### **Test từ 2 mạng khác nhau:**
- Máy 1: Wifi nhà
- Máy 2: Mobile hotspot / 4G

Nếu chỉ test cùng Wifi → sẽ dùng **host candidate** (direct connection), không cần TURN!

---

## 🔥 GIẢI PHÁP NÂNG CAO

### **Option 1: Tự host TURN server (Coturn)**

Nếu TURN miễn phí không ổn định, bạn có thể tự deploy Coturn trên VPS:

```bash
# Ubuntu/Debian
sudo apt install coturn

# Config file: /etc/turnserver.conf
listening-port=3478
fingerprint
lt-cred-mech
user=youruser:yourpassword
realm=yourdomain.com
```

Sau đó trong `Peer.js`:
```javascript
{
  urls: "turn:yourvps.com:3478",
  username: "youruser",
  credential: "yourpassword"
}
```

### **Option 2: Dùng service trả phí**

- **Twilio TURN** (có free tier): https://www.twilio.com/stun-turn
- **Metered.ca** (pay as you go): https://www.metered.ca/
- **Xirsys** (có free tier): https://xirsys.com/

---

## 🧪 TEST SCENARIO

### **Scenario 1: Cùng Wifi (LAN)**
- Kết quả mong đợi: Dùng **host** hoặc **srflx** candidate
- TURN: Không cần thiết

### **Scenario 2: Khác mạng (WAN)**
- Kết quả mong đợi: Dùng **relay** candidate
- TURN: **BẮT BUỘC** phải hoạt động

### **Scenario 3: Mạng enterprise bị firewall**
- Kết quả mong đợi: Chỉ **relay (TCP port 443)** mới work
- Giải pháp: Dùng `turn:...?transport=tcp` qua port 443

---

## ✅ XÁC NHẬN TURN HOẠT ĐỘNG

Chạy command này trong browser console khi đang trong phòng:

```javascript
// Kiểm tra xem có relay candidate không
const stats = await peerService.peer.getStats();
stats.forEach(report => {
  if (report.type === 'candidate-pair' && report.state === 'succeeded') {
    console.log('✅ Connected using:', report);
  }
});
```

Nếu `candidateType: "relay"` → TURN đang được sử dụng! 🎉

---

## 📞 CẦN HELP?

1. Gửi screenshot browser console (F12 → Console tab)
2. Kết quả test từ `test-turn.html`
3. Output của `getStats()` command ở trên

---

## 🚀 NEXT STEPS

1. ✅ Đã thêm nhiều TURN servers backup vào `Peer.js`
2. ⏳ Test bằng `test-turn.html`
3. ⏳ Deploy lên server thực và test từ 2 mạng khác nhau
4. ⏳ Nếu vẫn không work → Xem xét tự host Coturn

Good luck! 🎯
