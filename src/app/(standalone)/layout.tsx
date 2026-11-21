import Link from "next/link";
import { Layers3 } from "lucide-react";

import { UserButton } from "@/features/auth/components/user-button";

interface StandloneLayoutProps {
  children: React.ReactNode;
};

const StandloneLayout = ({ children }: StandloneLayoutProps) => {
  return ( 
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex h-[73px] items-center justify-between border-b border-navy/10">
          <Link href="/">
            <span className="flex items-center gap-3 font-display text-xl font-bold tracking-tight text-navy">
              <Layers3 className="size-6 text-champagne" />
              GoTask
            </span>
          </Link>
          <UserButton />
        </nav>
        <div className="flex flex-col items-center justify-center py-4">
          {children}
        </div>
      </div>
    </main>
  );
}
 
export default StandloneLayout;