import Link from "next/link";
import { Layers3 } from "lucide-react";

import { Projects } from "./projects";
import { Navigation } from "./navigation";
import { DottedSeparator } from "./dotted-separator";
import { WorkspaceSwitcher } from "./workspace-switcher";

export const Sidebar = () => {
  return (
    <aside className="flex h-full w-full flex-col border-r border-navy/10 bg-navy px-4 py-5 text-ivory">
      <Link href="/" aria-label="GoTask home" className="flex items-center gap-3 rounded-lg px-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne">
        <span className="flex size-9 items-center justify-center rounded-lg border border-champagne/40 bg-ivory/5 text-champagne">
          <Layers3 className="size-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-ivory">GoTask</span>
      </Link>
      <DottedSeparator color="#F7F6F233" className="my-5" />
      <WorkspaceSwitcher />
      <DottedSeparator color="#F7F6F233" className="my-5" />
      <Navigation />
      <DottedSeparator color="#F7F6F233" className="my-5" />
      <div className="min-h-0 flex-1">
        <Projects />
      </div>
    </aside>
  );
};
