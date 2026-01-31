# ✅ TURN SERVER DEBUG CHECKLIST

## 🚀 Server đang chạy:
- ✅ Server: http://localhost:8000
- ✅ Client: http://localhost:5173

---

## 📋 BƯỚC KIỂM TRA TURN

### **BƯỚC 1: Test TURN servers (standalone)**

1. Mở file này trong browser:
   ```
   d:\Final_commit\test-turn.html
   ```

2. Click "🚀 Bắt đầu Test"

3. **Kết quả mong đợi:**
   - Thấy `🔥 TURN Relay Candidates: X` (X > 0)
   - Thấy message "🎉 TURN SERVERS HOẠT ĐỘNG!"

4. **Nếu relay = 0:**
   - ⚠️ TURN servers bị firewall chặn
   - ⚠️ TURN servers miễn phí hết quota
   - ⚠️ Network không cho phép TURN traffic

---

### **BƯỚC 2: Test trong app thực tế**

1. Mở 2 browser windows:
   - Window 1: http://localhost:5173
   - Window 2: http://localhost:5173 (hoặc http://192.168.10.1:5173 từ máy khác)

2. Mở **Developer Console (F12)** ở cả 2 windows

3. Vào cùng 1 phòng với email khác nhau

4. **XEM CONSOLE LOG:**

   ✅ **ĐIỀU TỐT - TURN hoạt động:**
   ```
   🧊 ICE Candidate found: {
     type: "relay",
     protocol: "udp",
     relay: "YES (USING TURN)"
   }
   🧊 ICE Connection State: connected
   ```

   ❌ **ĐIỀU XẤU - TURN KHÔNG hoạt động:**
   ```
   🧊 ICE Candidate found: {type: "host", relay: "NO"}
   🧊 ICE Candidate found: {type: "srflx", relay: "NO"}
   🧊 ICE Connection State: failed (hoặc disconnected)
   ```

---

### **BƯỚC 3: Test WAN (2 mạng khác nhau)**

**Lưu ý:** Nếu test cùng Wifi, sẽ dùng **host candidate** (direct), KHÔNG CẦN TURN!

Để test TURN thực sự, làm như sau:

1. **Deploy server lên internet** (Render.com hoặc Railway)
   - Đã có: `https://rtc-juke.onrender.com`

2. **Test từ 2 devices khác mạng:**
   - Máy 1: Wifi nhà
   - Máy 2: Mobile hotspot / 4G

3. **Kiểm tra console:**
   - Nếu thấy `relay` → TURN đang work ✅
   - Nếu không → TURN bị block ❌

---

## 🔍 DEBUG COMMANDS

### **Check ICE connection details:**

Paste vào browser console khi đang trong phòng:

```javascript
// Import peer service (nếu có export)
const peer = peerService.peer; // hoặc tìm trong window/global

// Xem tất cả ICE candidates
peer.onicecandidate = (e) => {
  if (e.candidate) {
    console.log('🧊', e.candidate.type, e.candidate.protocol, e.candidate.address);
  }
};

// Xem stats chi tiết
const stats = await peer.getStats();
stats.forEach(report => {
  if (report.type === 'candidate-pair') {
    console.log('Candidate Pair:', report);
  }
});
```

### **Force chỉ dùng TURN (để test):**

Trong `Peer.js`, thay đổi:
```javascript
iceTransportPolicy: 'relay'  // Chỉ dùng TURN, không dùng direct
```

Nếu vẫn connect được → TURN OK ✅
Nếu không connect → TURN failed ❌

**Nhớ đổi lại `'all'` sau khi test!**

---

## ⚠️ CÁC LỖI THƯỜNG GẶP

### **1. Không thấy relay candidates**
**Nguyên nhân:**
- TURN servers bị firewall/proxy chặn
- Credentials sai
- TURN servers miễn phí hết quota/down

**Giải pháp:**
- Thử TURN server khác
- Tự host Coturn trên VPS
- Dùng service trả phí (Twilio, Metered.ca)

### **2. ICE Connection State = "failed"**
**Nguyên nhân:**
- Không có TURN server nào hoạt động
- Cả STUN và TURN đều bị chặn
- Signaling server không kết nối được

**Giải pháp:**
- Check server logs
- Verify CORS settings
- Test với `iceTransportPolicy: 'relay'`

### **3. Video đen (black screen)**
**Nguyên nhân:**
- Không liên quan TURN
- Media stream chưa ready
- Permissions camera/mic bị deny

**Giải pháp:**
- Check `getUserMedia()` có success không
- Verify `myStream` có tracks không

---

## 📊 EXPECTED RESULTS

### **Scenario 1: Cùng mạng (LAN)**
```
✅ host candidates: 2-3
✅ srflx candidates: 1-2
⚠️ relay candidates: 0-2 (không bắt buộc)
✅ Connection State: connected
```
→ **Kết luận:** App work, nhưng chưa chứng minh TURN hoạt động

### **Scenario 2: Khác mạng (WAN)**
```
✅ host candidates: 2-3
✅ srflx candidates: 1-2
🔥 relay candidates: 2-4 (BẮT BUỘC!)
✅ Connection State: connected
```
→ **Kết luận:** TURN đang hoạt động ✅

### **Scenario 3: Force relay mode**
```javascript
iceTransportPolicy: 'relay'
```
```
❌ host candidates: 0 (bị disable)
❌ srflx candidates: 0 (bị disable)
🔥 relay candidates: 2-4
✅ Connection State: connected (CHỈ KHI TURN OK)
```
→ **Kết luận:** TURN 100% hoạt động ✅

---

## 🎯 NEXT ACTIONS

1. ✅ Client đang chạy tại: http://localhost:5173
2. ✅ Server đang chạy tại: http://localhost:8000
3. ⏳ Mở `test-turn.html` để test TURN servers
4. ⏳ Vào app và kiểm tra console logs
5. ⏳ Nếu cần, deploy lên internet và test từ 2 mạng khác nhau

---

## 📸 CHỤP SCREENSHOT ĐỂ DEBUG

Nếu cần help, gửi screenshots của:
1. Browser console logs (toàn bộ ICE candidates)
2. Kết quả từ `test-turn.html`
3. Network tab (WebSocket connection)
4. `getStats()` output

Good luck! 🚀
