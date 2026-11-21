import { AlertTriangle } from "lucide-react";

interface PageErrorProps {
  message: string;
}

export const PageError = ({
  message = "Something went wrong",
}: PageErrorProps) => {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-navy/10 bg-ivory px-6 text-center shadow-sm shadow-navy/[0.025]">
      <div className="mb-3 rounded-lg bg-champagne/15 p-3 text-navy">
        <AlertTriangle className="size-5" />
      </div>
      <p className="max-w-md text-sm font-medium text-navy/65">
        {message}
      </p>
    </div>
  );
};
