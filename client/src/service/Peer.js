class PeerService {
  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        // Google STUN (Free & Fast)
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },


        // 🔥 METERED OPENRELAY (Public, Free, Port 80/443 - Không bị chặn)
        {
          urls: "turn:a.relay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:a.relay.metered.ca:80?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:a.relay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:a.relay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    this.chatChannel = null;
    this.fileChannel = null;
    this.iceCandidateQueue = [];
    this.isRemoteSet = false;
  }

  // Create offer
  async getOffer() {
    // Chỉ tạo offer khi stable hoặc ban đầu
    if (this.peer.signalingState !== "stable" && this.peer.signalingState !== "have-local-offer") return;

    const offer = await this.peer.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await this.peer.setLocalDescription(offer);
    return offer;
  }

  // Create answer
  async getAnswer(offer) {
    // Đảm bảo setRemote trước
    if (this.peer.signalingState !== "have-remote-offer") {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
    }
    this.isRemoteSet = true;
    this.processIceQueue();

    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    return answer;
  }

  // Set remote description (cho answer)
  async setLocalDescription(ans) {
    if (this.peer.signalingState === "have-local-offer") {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
      this.isRemoteSet = true;
      this.processIceQueue();
    }
  }

  // Add ICE candidate with buffer safety (#13 - Fix lỗi Timing)
  async addIceCandidate(candidate) {
    if (this.isRemoteSet && this.peer.remoteDescription) {
      try {
        await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    } else {
      // Nếu remote description chưa set, queue lại candidate
      this.iceCandidateQueue.push(candidate);
    }
  }

  // Xử lý queue khi remote description đã set
  processIceQueue() {
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      this.peer.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(error => console.error("Process buffered ICE Error:", error));
    }
  }
}

export default new PeerService();