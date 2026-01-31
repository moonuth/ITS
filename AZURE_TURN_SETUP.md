# 🚀 HƯỚNG DẪN FIX AZURE TURN SERVER

## ⚠️ VẤN ĐỀ: Azure TURN (20.197.12.68:3478) không kết nối được

---

## ✅ GIẢI PHÁP - LÀM TỪNG BƯỚC:

### **BƯỚC 1: Kiểm tra Coturn đã cài và chạy chưa**

SSH vào Azure VM:

```bash
# Check coturn installed
coturn --version

# Check service status
sudo systemctl status coturn

# Nếu chưa cài:
sudo apt update
sudo apt install coturn -y
```

---

### **BƯỚC 2: Config Coturn đúng**

Copy config từ file `azure-coturn-config.conf` vào `/etc/turnserver.conf`:

```bash
sudo nano /etc/turnserver.conf
```

**Paste nội dung này:**

```conf
listening-port=3478
tls-listening-port=5349

# QUAN TRỌNG: Thay bằng IP public Azure của bạn
external-ip=20.197.12.68

realm=20.197.12.68

verbose
log-file=/var/log/turnserver.log

lt-cred-mech
user=turnuser:turnpass123

relay-ip=20.197.12.68

min-port=49152
max-port=65535

fingerprint
no-multicast-peers
no-cli
no-loopback-peers
```

Save file (Ctrl+X → Y → Enter)

---

### **BƯỚC 3: MỞ FIREWALL AZURE (CRITICAL!)**

#### **A. Trong Azure Portal:**

1. Vào VM → **Networking** → **Network settings**
2. Click **Add inbound port rule**
3. Thêm các rules:

| Port | Protocol | Name |
|------|----------|------|
| 3478 | TCP | TURN-TCP |
| 3478 | UDP | TURN-UDP |
| 5349 | TCP | TURNS-TLS |
| 49152-65535 | UDP | TURN-RELAY |

**Priority:** 100
**Source:** Any
**Destination:** Any

#### **B. Trong VM (UFW firewall):**

```bash
# Mở firewall
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 5349/tcp
sudo ufw allow 49152:65535/udp

# Check status
sudo ufw status
```

---

### **BƯỚC 4: Start Coturn**

```bash
# Enable coturn
sudo systemctl enable coturn

# Start coturn
sudo systemctl start coturn

# Check status
sudo systemctl status coturn

# Xem logs
sudo tail -f /var/log/turnserver.log
```

**Logs tốt sẽ thấy:**
```
0: : Relay listener opened on: 20.197.12.68:3478
0: : TLS/DTLS listener opened on: 20.197.12.68:5349
```

---

### **BƯỚC 5: Test TURN từ máy local**

#### **Option A: Dùng web tool (dễ nhất)**

1. Vào: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
2. Xóa tất cả ICE servers mặc định
3. Thêm:
   ```
   turn:20.197.12.68:3478
   ```
4. Username: `turnuser`
5. Password: `turnpass123`
6. Click **Gather candidates**

**Kết quả mong đợi:**
```
✅ Thấy candidates với "typ relay"
```

#### **Option B: Dùng command line**

```bash
# Install turnutils (Ubuntu/WSL)
sudo apt install coturn-utils

# Test
turnutils_uclient -v -u turnuser -w turnpass123 20.197.12.68

# Kết quả tốt:
# 0: Total connect time is 0
# 0: Start listening on 0.0.0.0:XXXXX
# ... relay allocation success ...
```

---

### **BƯỚC 6: Deploy lên Render và test WAN**

Nếu BƯỚC 5 thành công:

```bash
cd d:\Final_commit

# Commit changes
git add .
git commit -m "feat: add Azure TURN server"
git push origin main
```

Render tự động deploy → **Test từ 4G + WiFi!**

---

## 🔍 DEBUG NẾU VẪN KHÔNG WORK:

### **1. Check Coturn logs:**
```bash
sudo journalctl -u coturn -f
```

### **2. Test port từ internet:**
```bash
# Từ máy local
nc -zv 20.197.12.68 3478
telnet 20.197.12.68 3478
```

### **3. Check Azure NSG (Network Security Group):**
- Vào VM → Networking → **Effective security rules**
- Verify các inbound rules đã apply

### **4. Check coturn process:**
```bash
sudo netstat -tulpn | grep 3478
# Phải thấy coturn listening trên port 3478
```

---

## 📋 CHECKLIST:

- [ ] Coturn installed và running
- [ ] Config file `/etc/turnserver.conf` đúng với IP public
- [ ] Azure NSG mở ports: 3478 (TCP/UDP), 5349, 49152-65535
- [ ] UFW firewall trong VM mở ports
- [ ] Test với webrtc trickle-ice tool thấy "typ relay"
- [ ] Deploy lên Render
- [ ] Test WAN (4G + WiFi) thành công

---

## 💡 LƯU Ý:

1. **Username/Password:** Nếu đổi credentials, nhớ update cả:
   - `/etc/turnserver.conf`
   - `Peer.js`

2. **IP Public thay đổi:** Nếu Azure VM restart và IP đổi, phải update lại config

3. **Production:** Nên dùng domain + SSL certificate thay vì IP

---

## 🎯 SAU KHI FIX XONGbang

Bạn sẽ có:
- ✅ TURN server riêng (không bị giới hạn quota)
- ✅ WAN connection ổn định 100%
- ✅ Không phụ thuộc TURN miễn phí

Good luck! 🚀
