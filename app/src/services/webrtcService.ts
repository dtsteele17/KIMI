import { supabase } from '@/lib/supabase';

interface XirsysIceServers {
  iceServers: RTCIceServer[];
}

export class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private matchId: string;
  private userId: string;
  private onRemoteStream: (stream: MediaStream) => void;
  private onConnectionStateChange: (state: RTCPeerConnectionState) => void;

  constructor(
    matchId: string,
    userId: string,
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void
  ) {
    this.matchId = matchId;
    this.userId = userId;
    this.onRemoteStream = onRemoteStream;
    this.onConnectionStateChange = onConnectionStateChange;
  }

  // Get ICE servers from Xirsys
 private async getXirsysIceServers(): Promise<XirsysIceServers> {
  const ident = import.meta.env.VITE_XIRSYS_IDENT;
  const secret = import.meta.env.VITE_XIRSYS_SECRET;
  
  if (!ident || !secret) {
    throw new Error('Xirsys credentials not configured');
  }

  const response = await fetch('https://global.xirsys.net/_turn/MyFirstApp', {
    method: 'PUT',
    headers: {
      'Authorization': 'Basic ' + btoa(`steele17 : 6ffd4eca-f979-11f0-865b-0242ac150003`),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      format: "urls",
      expire: 3600
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get Xirsys ICE servers');
  }

  return await response.json();
}

  // Initialize WebRTC connection
  async initialize(isInitiator: boolean) {
    try {
      // Get ICE servers from Xirsys
      const iceServers = await this.getXirsysIceServers();
      
      // Create peer connection
      this.pc = new RTCPeerConnection({
        iceServers: iceServers.iceServers,
        iceTransportPolicy: 'all'
      });

      // Handle remote stream
      this.pc.ontrack = (event) => {
        console.log('Got remote stream');
        this.remoteStream = event.streams[0];
        this.onRemoteStream(event.streams[0]);
      };

      // Handle connection state changes
      this.pc.onconnectionstatechange = () => {
        console.log('Connection state:', this.pc?.connectionState);
        this.onConnectionStateChange(this.pc?.connectionState || 'closed');
      };

      // Handle ICE candidates
      this.pc.onicecandidate = async (event) => {
        if (event.candidate) {
          // Send ICE candidate to other player via Supabase
          await this.sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate,
            from: this.userId
          });
        }
      };

      // Get local camera stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment"
        },
        audio: false
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.pc?.addTrack(track, this.localStream!);
      });

      // Subscribe to signaling messages
      this.subscribeToSignals();

      // If initiator, create offer
      if (isInitiator) {
        await this.createOffer();
      }

      return this.localStream;
    } catch (error) {
      console.error('WebRTC initialization error:', error);
      throw error;
    }
  }

  // Create and send offer
  private async createOffer() {
    if (!this.pc) return;

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    await this.sendSignal({
      type: 'offer',
      sdp: offer,
      from: this.userId
    });
  }

  // Handle incoming offer
  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.pc) return;

    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    await this.sendSignal({
      type: 'answer',
      sdp: answer,
      from: this.userId
    });
  }

  // Handle incoming answer
  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // Handle ICE candidate
  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) return;
    await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  // Send signaling message via Supabase
  private async sendSignal(data: any) {
    await supabase
      .from('webrtc_signals')
      .insert({
        match_id: this.matchId,
        data: data,
        created_by: this.userId
      });
  }

  // Subscribe to signaling messages
  private subscribeToSignals() {
    supabase
      .channel(`webrtc:${this.matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'webrtc_signals',
        filter: `match_id=eq.${this.matchId}`
      }, (payload) => {
        const signal = payload.new.data;
        
        // Ignore own messages
        if (signal.from === this.userId) return;

        console.log('Received signal:', signal.type);

        switch (signal.type) {
          case 'offer':
            this.handleOffer(signal.sdp);
            break;
          case 'answer':
            this.handleAnswer(signal.sdp);
            break;
          case 'ice-candidate':
            this.handleIceCandidate(signal.candidate);
            break;
        }
      })
      .subscribe();
  }

  // Stop camera and close connection
  disconnect() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.pc?.close();
    this.pc = null;
    this.localStream = null;
    this.remoteStream = null;
  }

  // Toggle camera on/off
  toggleCamera(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}