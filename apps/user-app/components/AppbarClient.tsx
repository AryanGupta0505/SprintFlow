
"use client";

import { signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";
import { useRouter } from "next/navigation";
import NotificationBell from "./NotificationBell";
import { useSidebar } from "./SidebarContext";

export function AppbarClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toggle, isOpen } = useSidebar();

  return (
    <Appbar
      user={session?.user}
      onSignin={() => router.push("/signin")}
      onSignout={async () => {
        await signOut({ callbackUrl: "/signin" });
        router.push("/signin");
      }}
      leftContent={
  status === "authenticated" ? (
    <button
      onClick={toggle}
      aria-label="Toggle Sidebar"
      className="
        w-11 h-11
        flex items-center justify-center
        rounded-xl
        border border-slate-200
        bg-white
        shadow-sm
        hover:shadow-md
        hover:bg-slate-50
        active:scale-95
        transition-all duration-200
      "
    >
      <div className="space-y-1.5">
        <span className="block w-5 h-0.5 bg-slate-800 rounded"></span>
        <span className="block w-5 h-0.5 bg-slate-800 rounded"></span>
        <span className="block w-5 h-0.5 bg-slate-800 rounded"></span>
      </div>
    </button>
  ) : null
}
      rightContent={
        status === "authenticated" ? <NotificationBell /> : null
      }
    />
  );
}