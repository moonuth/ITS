class PeerService {
  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        // STUN Servers
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:relay.metered.ca:80" },

        // 🔥 PRIORITY 1: YOUR AZURE TURN SERVER (Most reliable!)
        {
          urls: "turn:20.197.12.68:3478",
          username: "hphuc",
          credential: "hphuc123456",
        },
        {
          urls: "turn:20.197.12.68:3478?transport=tcp",
          username: "hphuc",
          credential: "hphuc123456",
        },

        // 🔥 PRIORITY 2: METERED TURN (Fallback)
        {
          urls: "turn:a.relay.metered.ca:80",
          username: "4e8b0e7f2b4c2e5a3f1d6c8b",
          credential: "testing123",
        },
        {
          urls: "turn:a.relay.metered.ca:80?transport=tcp",
          username: "4e8b0e7f2b4c2e5a3f1d6c8b",
          credential: "testing123",
        },
        {
          urls: "turn:a.relay.metered.ca:443",
          username: "4e8b0e7f2b4c2e5a3f1d6c8b",
          credential: "testing123",
        },
        {
          urls: "turn:a.relay.metered.ca:443?transport=tcp",
          username: "4e8b0e7f2b4c2e5a3f1d6c8b",
          credential: "testing123",
        },

        // 🔥 PRIORITY 3: TWILIO TURN (Additional fallback)
        {
          urls: "turn:global.turn.twilio.com:3478?transport=udp",
          username: "f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d",
          credential: "w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLg="
        },
        {
          urls: "turn:global.turn.twilio.com:3478?transport=tcp",
          username: "f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d",
          credential: "w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLg="
        },
        {
          urls: "turn:global.turn.twilio.com:443?transport=tcp",
          username: "f4b4035eaa76f4a55de5f4351567653ee4ff6fa97b50b6b334fcc1be9c27212d",
          credential: "w1uxM55V9yVoqyVFjt+mxDBV0F87AUCemaYVQGxsPLg="
        },

        // 🔥 PRIORITY 4: OPENRELAY (Last resort)
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });

    // 🔍 DEBUG: Log cấu hình ICE
    console.log("🔧 ICE Servers configured:", this.peer.getConfiguration().iceServers);

    // 🔍 Monitor ICE connection state
    this.peer.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE Connection State: ${this.peer.iceConnectionState}`);
      if (this.peer.iceConnectionState === 'failed') {
        console.error('❌ ICE Connection FAILED - TURN servers may not be working');
      }
      if (this.peer.iceConnectionState === 'connected' || this.peer.iceConnectionState === 'completed') {
        console.log('✅ ICE Connection SUCCESS! (WAN có thể đã dùng relay)');
      }
    };

    // 🔍 Monitor ICE gathering state
    this.peer.onicegatheringstatechange = () => {
      console.log(`📡 ICE Gathering State: ${this.peer.iceGatheringState}`);
    };

    // 🔍 Log all ICE candidates (xem có relay không)
    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        const c = event.candidate;
        console.log(`🧊 ICE Candidate found:`, {
          type: c.type,
          protocol: c.protocol,
          address: c.address || c.candidate.split(' ')[4],
          port: c.port,
          relatedAddress: c.relatedAddress,
          candidate: c.candidate,
          relay: c.type === 'relay' ? 'YES (USING TURN)' : 'NO'
        });
      } else {
        console.log('✅ ICE Gathering complete');
      }
    };

    this.chatChannel = null;
    this.fileChannel = null;
    this.iceCandidateQueue = [];
    this.isRemoteSet = false;
  }

  // Create offer
  async getOffer() {
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

  // Add ICE candidate with buffer safety
  async addIceCandidate(candidate) {
    if (this.isRemoteSet && this.peer.remoteDescription) {
      try {
        await this.peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    } else {
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

export default PeerService;