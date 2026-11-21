import { useParams, useSearchParams } from "next/navigation";

export const useInviteCode = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  return (params.inviteCode as string | undefined)
    ?? searchParams.get("code")
    ?? searchParams.get("inviteCode")
    ?? "";
};
