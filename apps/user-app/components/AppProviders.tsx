"use client";

import { useSession } from "next-auth/react";
import { NotificationProvider } from "./NotificationProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  // Only wrap with NotificationProvider if logged in
  if (status === "authenticated") {
    return <NotificationProvider>{children}</NotificationProvider>;
  }

  return <>{children}</>;
}