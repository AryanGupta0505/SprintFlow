

"use client";

import type { Notification } from "./NotificationProvider";
import { useNotifications } from "./NotificationProvider";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

export default function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const { markAsRead } = useNotifications();

  const metadata: any = notification.metadata || {};
  const event = notification.event;

  const formattedAmount =
    metadata?.amount != null ? `₹${metadata.amount / 100}` : null;

  let direction: "UP" | "DOWN" | null = null;
  let color = "text-slate-800";
  let bg = "bg-white";
  let iconBg = "bg-slate-100";
  let message = notification.message;

  /* -------------------------
     BANK EVENTS
  -------------------------- */

  if (event === "BANK_WITHDRAWAL_SUCCESS") {
    // 🟢 Onramp → Added to wallet
    direction = "DOWN";
    color = "text-green-600";
    bg = "bg-green-50";
    iconBg = "bg-green-100";
    message = `Added to your wallet via ${metadata.provider}`;
  }

  if (event === "BANK_DEPOSIT_SUCCESS") {
    // 🔴 Offramp → Sent to provider
    direction = "UP";
    color = "text-red-600";
    bg = "bg-red-50";
    iconBg = "bg-red-100";
    message = `Sent to ${metadata.provider} from your wallet`;
  }

  /* -------------------------
     P2P EVENTS
  -------------------------- */

  if (event === "PAYMENT_SENT") {
    const masked =
      metadata.phone?.length === 10
        ? `XXXXXX${metadata.phone.slice(-4)}`
        : metadata.phone;

    direction = "UP";
    color = "text-red-600";
    bg = "bg-red-50";
    iconBg = "bg-red-100";
    message = `Sent to ${masked}`;
  }

  if (event === "PAYMENT_RECEIVED") {
    const masked =
      metadata.phone?.length === 10
        ? `XXXXXX${metadata.phone.slice(-4)}`
        : metadata.phone;

    direction = "DOWN";
    color = "text-green-600";
    bg = "bg-green-50";
    iconBg = "bg-green-100";
    message = `Received from ${masked}`;
  }
  if (event === "PAYMENT_REQUEST_RECEIVED") {
  const masked =
    metadata.phone?.length === 10
      ? `XXXXXX${metadata.phone.slice(-4)}`
      : metadata.phone;

  direction = "UP";
  color = "text-indigo-600";
  bg = "bg-indigo-50";
  iconBg = "bg-indigo-100";
  message = `Request from ${masked}`;
}

if (event === "PAYMENT_REQUEST_ACCEPTED") {
  const masked =
    metadata.phone?.length === 10
      ? `XXXXXX${metadata.phone.slice(-4)}`
      : metadata.phone;

  direction = "DOWN";
  color = "text-green-600";
  bg = "bg-green-50";
  iconBg = "bg-green-100";
  message = `Request paid by ${masked}`;
}
  /* -------------------------
     SECURITY
  -------------------------- */

  if (notification.category === "SECURITY") {
    direction = null;
    color = "text-yellow-600";
    bg = "bg-yellow-50";
    iconBg = "bg-yellow-100";
  }

  /* -------------------------
     ICON
  -------------------------- */

  let icon = null;

  if (notification.category === "SECURITY") {
    icon = <ShieldCheckIcon className="w-6 h-6 text-yellow-600" />;
  } else if (direction === "UP") {
    icon = <ArrowUpIcon className="w-6 h-6 text-red-600" />;
  } else if (direction === "DOWN") {
    icon = <ArrowDownIcon className="w-6 h-6 text-green-600" />;
  }

  return (
    <div
      onClick={() => {
        if (!notification.isRead) {
          markAsRead(notification.id);
        }
      }}
      className={`flex gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer
        ${!notification.isRead ? bg : "bg-white"}
        hover:shadow-md border border-slate-100`}
    >
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-11 h-11 rounded-full ${iconBg}`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-slate-800">
            {notification.title}
          </p>

          {!notification.isRead && (
            <span className="w-2 h-2 bg-indigo-600 rounded-full" />
          )}
        </div>

        {/* Amount shown only once */}
        {formattedAmount && (
          <p className={`text-xl font-bold mt-1 ${color}`}>
            {formattedAmount}
          </p>
        )}

        {/* Custom message */}
        <p className="text-sm text-slate-600 mt-1">
          {message}
        </p>

        {/* Time */}
        <p className="text-xs text-slate-400 mt-2">
          {new Date(notification.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}