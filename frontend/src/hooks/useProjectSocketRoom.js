import { useEffect } from "react";
import socket from "../lib/socket";

const useProjectSocketRoom = (projectId) => {
  useEffect(() => {
    if (!projectId) {
      return undefined;
    }

    const roomId = String(projectId);
    const joinRoom = () => {
      socket.emit("joinProject", roomId);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on("connect", joinRoom);
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.emit("leaveProject", roomId);
    };
  }, [projectId]);
};

export default useProjectSocketRoom;
