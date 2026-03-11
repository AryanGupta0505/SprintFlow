
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback
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
  markAllAsRead: () => void;
}

const NotificationContext =
  createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* =========================
     DERIVED UNREAD COUNT
  ========================= */

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    /* =========================
       INITIAL FETCH
    ========================= */

    const loadInitialData = async () => {
      try {

        const res = await fetch("/api/notifications", {
          cache: "no-store"
        });

        const data = await res.json();

        if (isMounted) {
          setNotifications(data);
        }

      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadInitialData();

    /* =========================
       CONNECT WEBSOCKET
    ========================= */

    const connectWebSocket = () => {

      if (socketRef.current?.readyState === WebSocket.OPEN) return;

      const wsProtocol =
        window.location.protocol === "https:" ? "wss" : "ws";

      const wsUrl =
  process.env.NEXT_PUBLIC_WS_URL ||
  `${wsProtocol}://${window.location.host}/ws`;

      const socket = new WebSocket(wsUrl);

      socket.onopen = async () => {

        console.log("🔌 WS Connected (frontend)");

        try {

          const res = await fetch("/api/notifications", {
            cache: "no-store"
          });

          const data = await res.json();

          setNotifications(data);

        } catch (err) {
          console.error("Notification sync failed", err);
        }
      };

      socket.onmessage = (event) => {

        console.log("WS MESSAGE:", event.data);

        try {

          const data = JSON.parse(event.data);

          /* =========================
             NEW NOTIFICATION
          ========================= */

          if (data.type === "NEW_NOTIFICATION") {

            setNotifications(prev => {

              if (prev.some(n => n.id === data.data.id)) {
                return prev;
              }

              return [
                {
                  id: data.data.id,
                  title: data.data.title,
                  message: data.data.message,
                  category: data.data.category,
                  event: data.data.event,
                  metadata: data.data.metadata ?? null,
                  createdAt: data.data.createdAt ?? new Date().toISOString(),
                  isRead: false
                },
                ...prev
              ];

            });

          }

          /* =========================
             BALANCE UPDATE
          ========================= */

          if (data.type === "BALANCE_UPDATE") {

            window.dispatchEvent(
              new CustomEvent("balance-update", {
                detail: data.data,
              })
            );

          }

          /* =========================
             PAYMENT REQUEST CREATED
          ========================= */

          if (data.type === "PAYMENT_REQUEST_CREATED") {

            window.dispatchEvent(
              new CustomEvent("payment-request-created", {
                detail: data.data,
              })
            );

          }

          /* =========================
             PAYMENT REQUEST UPDATED
          ========================= */

          if (data.type === "PAYMENT_REQUEST_UPDATED") {

            window.dispatchEvent(
              new CustomEvent("payment-request-updated", {
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

  /* =========================
     MARK SINGLE AS READ
  ========================= */

  const markAsRead = useCallback(async (id: number) => {
  try {

    await fetch(`/api/notifications/read/${id}`, {
      method: "PATCH",
    });

    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );

  } catch (err) {
    console.error("Failed to mark as read", err);
  }
}, []);

  /* =========================
     MARK ALL AS READ
  ========================= */

  const markAllAsRead = useCallback(async () => {
  try {

    await fetch("/api/notifications/read/all", {
      method: "PATCH",
    });

    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        isRead: true
      }))
    );
    window.location.reload()
  } catch (err) {
    console.error("Failed to mark all as read", err);
  }
}, []);

  /* =========================
     MEMO CONTEXT VALUE
  ========================= */

  const contextValue = useMemo(() => ({
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead
}), [notifications, unreadCount, markAsRead, markAllAsRead]);

  return (
    <NotificationContext.Provider value={contextValue}>
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