import { useEffect } from "react";
import socket from "../lib/socket";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearPresenceState,
  fetchPresenceSnapshot,
  presenceUpdated,
} from "../store/presenceSlice";

const useGlobalPresence = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const initialized = useAppSelector((state) => state.auth.initialized);
  const userId = useAppSelector((state) => state.auth.user?._id);

  useEffect(() => {
    if (token) {
      if (!socket.connected) {
        socket.connect();
      }
      return;
    }

    if (socket.connected) {
      socket.disconnect();
    }
  }, [token]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!token) {
      dispatch(clearPresenceState());
      return;
    }

    dispatch(fetchPresenceSnapshot());
  }, [dispatch, initialized, token]);

  useEffect(() => {
    const handlePresenceUpdate = (payload) => {
      dispatch(presenceUpdated(payload));
    };

    socket.on("presence:update", handlePresenceUpdate);

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Re-announce on reconnect so server tracks each tab/device socket correctly.
    const announceOnline = () => {
      socket.emit("userOnline", { userId });
    };

    socket.on("connect", announceOnline);

    if (socket.connected) {
      announceOnline();
    }

    return () => {
      socket.off("connect", announceOnline);
    };
  }, [userId]);
};

export default useGlobalPresence;
