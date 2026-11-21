"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

interface WorkspaceIdJoinClientProps {
  inviteCode: string;
}

export const WorkspaceIdJoinClient = ({ inviteCode }: WorkspaceIdJoinClientProps) => {
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading, isError } = useGetWorkspaceInfo({ workspaceId, inviteCode });

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !inviteCode || !initialValues) {
    return <PageError message="This workspace invitation could not be found or has expired." />
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValues={initialValues} inviteCode={inviteCode} />
    </div>
  );
};
