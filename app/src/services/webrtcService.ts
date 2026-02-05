import { supabase } from '@/lib/supabase';

interface XirsysIceServers {
  iceServers: RTCIceServer[];
}

type SignalType = 'offer' | 'answer' | 'ice-candidate' | 'forfeit';

interface Signal {
  type: SignalType;
  from: string;
  to?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  data?: any;
}

export class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private matchId: string;
  private userId: string;
  private onRemoteStream: (stream: MediaStream) => void;
  private onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  private onSignal: (signal: Signal) => void;

  constructor(
    matchId: string,
    userId: string,
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange: (state: RTCPeerConnectionState) => void,
    onSignal?: (signal: Signal) => void
  ) {
    this.matchId = matchId;
    this.userId = userId;
    this.onRemoteStream = onRemoteStream;
    this.onConnectionStateChange = onConnectionStateChange;
    this.onSignal = onSignal || (() => {});
  }

  private async getXirsysIceServers(): Promise<XirsysIceServers> {
    const ident = import.meta.env.VITE_XIRSYS_IDENT;
    const secret = import.meta.env.VITE_XIRSYS_SECRET;
    
    if (!ident || !secret) {
      console.error('Xirsys credentials not found');
      return { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    }

    try {
      const response = await fetch('https://global.xirsys.net/_turn/MyFirstApp', {
        method: 'PUT',
        headers: {
          'Authorization': 'Basic ' + btoa(`${ident}:${secret}`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format: "urls", expire: 3600 })
      });

      if (!response.ok) throw new Error('Failed to get ICE servers');
      return await response.json();
    } catch (err) {
      console.error('Xirsys error, using fallback:', err);
      return { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    }
  }

  async initialize(isInitiator: boolean) {
    try {
      const iceServers = await this.getXirsysIceServers();
      
      this.pc = new RTCPeerConnection({ iceServers: iceServers.iceServers });
      
      this.pc.ontrack = (event) => {
        console.log('Remote track received:', event.streams[0]);
        this.remoteStream = event.streams[0];
        this.onRemoteStream(event.streams[0]);
      };

      this.pc.onconnectionstatechange = () => {
        const state = this.pc?.connectionState || 'closed';
        console.log('WebRTC state:', state);
        this.onConnectionStateChange(state);
      };

      this.pc.onicecandidate = async (event) => {
        if (event.candidate) {
          await this.sendSignal({
            type: 'ice-candidate',
            candidate: event.candidate,
            from: this.userId
          });
        }
      };

      // Get camera
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });

      // Add tracks
      this.localStream.getTracks().forEach(track => {
        this.pc?.addTrack(track, this.localStream!);
      });

      // Subscribe to signals
      this.subscribeToSignals();

      // Create offer if initiator
      if (isInitiator) {
        console.log('Creating offer...');
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        await this.sendSignal({ type: 'offer', sdp: offer, from: this.userId });
      }

      return this.localStream;
    } catch (error) {
      console.error('WebRTC init error:', error);
      throw error;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    console.log('Handling offer...');
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    await this.sendSignal({ type: 'answer', sdp: answer, from: this.userId });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    console.log('Handling answer...');
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) return;
    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }

  private async sendSignal(signal: Signal) {
    try {
      await supabase.from('webrtc_signals').insert({
        match_id: this.matchId,
        data: signal,
        created_by: this.userId
      });
    } catch (err) {
      console.error('Error sending signal:', err);
    }
  }

  private subscribeToSignals() {
    const channel = supabase
      .channel(`webrtc:${this.matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'webrtc_signals',
        filter: `match_id=eq.${this.matchId}`
      }, (payload) => {
        const signal = payload.new.data as Signal;
        
        if (signal.from === this.userId) return; // Ignore own messages
        
        console.log('Received signal:', signal.type, 'from:', signal.from);
        this.onSignal(signal);

        switch (signal.type) {
          case 'offer':
            this.handleOffer(signal.sdp!);
            break;
          case 'answer':
            this.handleAnswer(signal.sdp!);
            break;
          case 'ice-candidate':
            this.handleIceCandidate(signal.candidate!);
            break;
        }
      })
      .subscribe();

    return channel;
  }

  toggleCamera(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  disconnect() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.pc?.close();
    this.pc = null;
  }

  getLocalStream() { return this.localStream; }
  getRemoteStream() { return this.remoteStream; }
  
  async sendForfeit() {
    await this.sendSignal({ type: 'forfeit', from: this.userId });
  }
}