"use client";
import { usePathname, useRouter } from "next/navigation";

export const SidebarItem = ({
  href,
  title,
  icon,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const selected = pathname === href;

  return (
    <div
      onClick={() => router.push(href)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
        ${
          selected
            ? "bg-teal-100 text-teal-700"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        }
      `}
    >
      <div className="w-5 h-5">{icon}</div>
      <div className="font-medium">{title}</div>
    </div>
  );
};
