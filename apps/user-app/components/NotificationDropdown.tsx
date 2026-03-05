
"use client";

import { useState } from "react";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "./NotificationProvider";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 4;

export default function NotificationDropdown() {
  const { notifications } = useNotifications();
  const router = useRouter();

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleNotifications = notifications.slice(0, visibleCount);

  const showViewMore =
    visibleCount === PAGE_SIZE &&
    notifications.length > PAGE_SIZE;

  const showViewAll =
    visibleCount === PAGE_SIZE * 2 &&
    notifications.length > PAGE_SIZE * 2;

  return (
    <div className="absolute right-0 mt-3 w-96 bg-white shadow-2xl rounded-2xl border border-slate-200 max-h-[500px] overflow-hidden z-50">

      {/* Header */}
      <div className="px-5 py-4 border-b bg-slate-50 rounded-t-2xl">
        <h3 className="text-lg font-semibold text-slate-800">
          Notifications
        </h3>
      </div>

      {/* Content */}
      <div className="max-h-[440px] overflow-y-auto p-2 space-y-2">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            You're all caught up 🎉
          </div>
        ) : (
          <>
            {visibleNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}

            {/* Pagination Buttons */}
            <div className="flex justify-center pt-2 pb-3">
              {showViewMore && (
                <button
                  onClick={() => setVisibleCount(PAGE_SIZE * 2)}
                  className="text-xs px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  View More
                </button>
              )}

              {showViewAll && (
                <button
                  onClick={() => router.push("/push-notifications")}
                  className="text-xs px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  View All
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}