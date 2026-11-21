"use client";

import { usePathname } from "next/navigation";

import { UserButton } from "@/features/auth/components/user-button";

import { MobileSidebar } from "./mobile-sidebar";

const pathnameMap = {
  "tasks": {
    title: "My Tasks",
    description: "Your priorities, all in one place",
  },
  "projects": {
    title: "Project",
    description: "Keep plans and progress moving",
  },
  "settings": {
    title: "Settings",
    description: "Manage your workspace preferences",
  },
  "members": {
    title: "Members",
    description: "Bring the right people into the work",
  },
};

const defaultMap = {
  title: "Workspace overview",
  description: "A focused view of your team's work",
};

export const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-navy/10 bg-ivory px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileSidebar />
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate font-display text-base font-semibold tracking-tight text-navy sm:text-lg">
            {title}
          </h1>
          <p className="hidden truncate text-sm text-navy/65 sm:block">
            {description}
          </p>
        </div>
      </div>
      <UserButton />
    </nav>
  );
};
