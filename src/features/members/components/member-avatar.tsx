import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MemberAvatarProps {
  name: string;
  className?: string;
  fallbackClassName?: string;
};

export const MemberAvatar = ({
  name,
  className,
  fallbackClassName
}: MemberAvatarProps) => {
  return (
    <Avatar className={cn("size-5 transition border border-navy/15 rounded-full", className)}>
      <AvatarFallback className={cn(
        "bg-champagne/20 font-medium text-navy flex items-center justify-center",
        fallbackClassName
      )}>
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};
