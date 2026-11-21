import { FaCaretDown, FaCaretUp } from "react-icons/fa";

import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: number;
  variant: "up" | "down";
  increaseValue: number;
};

export const AnalyticsCard = ({
  title,
  value,
  variant,
  increaseValue
}: AnalyticsCardProps) => {
  const iconColor = variant === "up" ? "text-champagne" : "text-navy/45";
  const increaseValueColor =
    variant === "up" ? "text-navy" : "text-navy/55";
  const Icon = variant === "up" ? FaCaretUp : FaCaretDown;

  return (
    <Card className="w-full border-none bg-transparent shadow-none">
      <CardHeader className="gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardDescription className="flex items-center gap-x-2 overflow-hidden font-medium">
            <span className="truncate text-xs uppercase tracking-wide text-navy/55">{title}</span>
          </CardDescription>
          <div className="flex items-center gap-x-0.5">
            <Icon className={cn(iconColor, "size-4")} />
            <span className={cn(increaseValueColor, "truncate text-xs font-semibold")}>
              {increaseValue}
            </span>
          </div>
        </div>
        <CardTitle className="font-display text-2xl font-bold tracking-tight text-navy">{value.toLocaleString()}</CardTitle>
      </CardHeader>
    </Card>
  );
};
