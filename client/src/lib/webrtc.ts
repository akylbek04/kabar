export const getIceServers = (): RTCIceServer[] => {
  const servers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  const turnUrl = import.meta.env.VITE_TURN_URL;
  if (turnUrl) {
    servers.push({
      urls: turnUrl,
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_CREDENTIAL,
    });
  }

  return servers;
};

export const getLocalMediaStream = async (
  withVideo: boolean
): Promise<MediaStream> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Your browser does not support calls");
  }

  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: withVideo ? { facingMode: "user", width: { ideal: 1280 } } : false,
  });
};

export const createPeerConnection = (
  onIceCandidate: (candidate: RTCIceCandidate) => void,
  onRemoteStream: (stream: MediaStream) => void
): RTCPeerConnection => {
  const pc = new RTCPeerConnection({ iceServers: getIceServers() });

  pc.onicecandidate = (event) => {
    if (event.candidate) onIceCandidate(event.candidate);
  };

  pc.ontrack = (event) => {
    if (event.streams[0]) onRemoteStream(event.streams[0]);
  };

  return pc;
};

export const attachLocalTracks = (
  pc: RTCPeerConnection,
  stream: MediaStream
) => {
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));
};

export const stopMediaStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};
