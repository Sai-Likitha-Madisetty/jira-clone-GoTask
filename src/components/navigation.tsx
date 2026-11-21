"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCircle2, Home, Settings2, Users } from "lucide-react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Home",
    href: "",
    icon: Home,
  },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: CheckCircle2,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings2,
  },
  {
    label: "Members",
    href: "/members",
    icon: Users,
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  return (
    <ul className="flex flex-col">
      {routes.map((item) => {
        const fullHref = `/workspaces/${workspaceId}${item.href}`
        const isActive = item.href
          ? pathname === fullHref || pathname.startsWith(`${fullHref}/`)
          : pathname === fullHref;
        const Icon = item.icon;
        
        return (
          <Link key={item.href} href={fullHref}>
            <div className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ivory/75 transition-all duration-200 hover:bg-ivory/10 hover:text-ivory",
              isActive && "bg-ivory/10 text-ivory shadow-sm shadow-navy/20 hover:bg-ivory/10 hover:text-ivory before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-champagne"
            )}>
              <Icon className={cn("size-[18px] text-ivory/50 transition-colors", isActive && "text-champagne")} />
              {item.label}
            </div>
          </Link>
        )
      })}
    </ul>
  );
};
