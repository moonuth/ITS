import React, { createContext, useContext, useMemo } from "react";
import io from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    // 1. Ưu tiên biến môi trường từ Render (VITE_SERVER_URL)
    // 2. Fallback sang localhost nếu chạy local
    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

    console.log("🔌 Connecting to Socket Server:", serverUrl);

    // Tạo connection với retry logic
    return io(serverUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
