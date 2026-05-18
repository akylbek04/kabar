import { useEffect } from "react";
import { useCall } from "@/hooks/use-call";
import { useSocket } from "@/hooks/use-socket";

const CallSignalingListener = () => {
  const { socket } = useSocket();
  const bindSocket = useCall((s) => s.bindSocket);

  useEffect(() => {
    if (!socket) return;
    return bindSocket(socket);
  }, [socket, bindSocket]);

  return null;
};

export default CallSignalingListener;
