# 🧠 PSEUDOCODE - THUẬT TOÁN MẠNG

Dưới đây là 3 đoạn mã giả thể hiện các quy trình cốt lõi của hệ thống.

---

## 1. Thuật toán: Join Room & Signaling (Client-Server)
*Mô tả cách Client tham gia phòng và quy trình xử lý của Server.*

```text
ALGORITHM Join_Room
BEGIN
    Input: Email, RoomID
    
    // Client Side
    Client emits "room:join" event with {Email, RoomID} to Server
    
    // Server Side (Handle Request)
    Server receives "room:join" request from SocketID
    
    IF RoomID exists THEN
        Server maps SocketID to RoomID
        Server emits "user:joined" to other sockets in RoomID
    ELSE
        Server creates new RoomID
        Server maps SocketID to RoomID
    END IF
    
    Server responds "room:joined" success to Client
    
    // Client Side (Response)
    IF success THEN
        Client navigates to Room Interface
        Initialize Camera & Microphone
    END IF
END
```

---

## 2. Thuật toán: Thiết lập P2P (WebRTC Handshake)
*Mô tả quy trình Offer/Answer để thiết lập kết nối ngang hàng.*

```text
ALGORITHM WebRTC_Setup
BEGIN
    // Peer A (Caller)
    Peer A captures Media Stream (Video/Audio)
    Peer A creates RTCPeerConnection Object
    Peer A creates Offer (SDP)
    Peer A sets LocalDescription(Offer)
    Peer A sends Offer -> Signaling Server -> Peer B
    
    // Peer B (Callee)
    Peer B receives Offer
    Peer B sets RemoteDescription(Offer)
    Peer B creates Answer (SDP)
    Peer B sets LocalDescription(Answer)
    Peer B sends Answer -> Signaling Server -> Peer A
    
    // Peer A (Finalize)
    Peer A receives Answer
    Peer A sets RemoteDescription(Answer)
    
    // Both Peers (Parallel Process)
    WHILE ICE Candidates are found DO
        Send Candidate -> Signaling Server -> Other Peer
        AddIceCandidate(Candidate)
    END WHILE
    
    IF Connection State == "Connected" THEN
        Start Streaming Media P2P
    END IF
END
```

---

## 3. Thuật toán: Truyền File P2P (Chunking)
*Mô tả cách chia nhỏ file để gửi qua Data Channel.*

```text
ALGORITHM P2P_File_Send
INPUT: Large File (>100MB)

BEGIN
    IF File size > Limit THEN Show Error
    
    Create Metadata Packet { Name, Size, Type }
    Send Metadata via DataChannel
    
    CurrentOffset = 0
    ChunkSize = 16KB (Max Safe UDP Payload)
    
    WHILE CurrentOffset < File.Size DO
        // Cắt file thành mảnh nhỏ
        BlobChunk = Slice(File, CurrentOffset, CurrentOffset + ChunkSize)
        ArrayBuffer = ConvertToBuffer(BlobChunk)
        
        // Kiểm tra tắc nghẽn mạng (Backpressure)
        IF DataChannel.bufferedAmount > HighWaterMark THEN
            Wait(50ms) // Chờ bộ đệm xả bớt
        END IF
        
        Send ArrayBuffer via DataChannel
        CurrentOffset += ChunkSize
        Update Progress Bar
    END WHILE
    
    Log "File Sent Successfully"
END
```
