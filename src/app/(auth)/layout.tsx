"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: React.ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";

  return ( 
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-screen-2xl p-4">
        <nav className="flex items-center justify-between border-b border-navy/10 py-3">
          <Link href="/" aria-label="GoTask home" className="font-display text-xl font-bold tracking-tight text-navy">GoTask</Link>
          <Button asChild variant="secondary">
            <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
              {isSignIn ? "Sign Up" : "Login"}
            </Link>
          </Button>
        </nav>
        <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
          {children}
        </div>
      </div>
    </main>
   );
}
 
export default AuthLayout;