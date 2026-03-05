
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface Notification {
  id: number;
  title: string;
  message: string;
  category: "TRANSACTION" | "SECURITY";
  event: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
}

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 🔹 Initial DB fetch
    const loadInitialData = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (isMounted) setNotifications(data);

        const unreadRes = await fetch("/api/notifications/unread");
        const unreadData = await unreadRes.json();
        if (isMounted) setUnreadCount(unreadData.count);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadInitialData();

    // 🔥 WebSocket connect function
    const connectWebSocket = () => {
      if (socketRef.current) return;

      const wsProtocol =
        window.location.protocol === "https:" ? "wss" : "ws";

      const wsUrl = `${wsProtocol}://${window.location.host}/ws`;

      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("🔌 WS Connected (frontend)");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // ✅ EXISTING FUNCTIONALITY (UNCHANGED)
          if (data.type === "NEW_NOTIFICATION") {
            setNotifications((prev) => [data.data, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }

          // 🔥 NEW: BALANCE UPDATE SUPPORT
          if (data.type === "BALANCE_UPDATE") {
            window.dispatchEvent(
              new CustomEvent("balance-update", {
                detail: data.data,
              })
            );
          }

        } catch (err) {
          console.error("Invalid WS message", err);
        }
      };

      socket.onclose = (event) => {
        console.log("🔌 WS Closed:", event.code);

        socketRef.current = null;

        // 🔁 Auto reconnect after 1 second
        reconnectTimeout.current = setTimeout(() => {
          connectWebSocket();
        }, 1000);
      };

      socket.onerror = (err) => {
        console.error("WS Error:", err);
      };

      socketRef.current = socket;
    };

    connectWebSocket();

    return () => {
      isMounted = false;

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }

      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close(1000);
      }

      socketRef.current = null;
    };
  }, []);

  async function markAsRead(id: number) {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}