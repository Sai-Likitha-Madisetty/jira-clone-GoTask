import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { WorkspaceIdJoinClient } from "./client";

interface WorkspaceJoinPageProps {
  searchParams: {
    code?: string | string[];
    inviteCode?: string | string[];
  };
}

const WorkspaceJoinPage = async ({ searchParams }: WorkspaceJoinPageProps) => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const rawInviteCode = searchParams.code ?? searchParams.inviteCode;
  const inviteCode = Array.isArray(rawInviteCode) ? rawInviteCode[0] ?? "" : rawInviteCode ?? "";

  return <WorkspaceIdJoinClient inviteCode={inviteCode} />;
};

export default WorkspaceJoinPage;
