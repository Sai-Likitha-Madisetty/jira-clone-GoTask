"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";

import { MemberRole } from "@/features/members/types";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { Separator } from "@/components/ui/separator";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PlusIcon } from "lucide-react";
import { InviteWorkspaceModal } from "./invite-workspace-modal";
import { useGetWorkspace } from "../api/use-get-workspace";
import { useState } from "react";

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { data: workspace, isLoading: isWorkspaceLoading } =
  useGetWorkspace({ workspaceId }); 
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace",
    "destructive"
  );
  
  const { data, isLoading, isError } = useGetMembers({ workspaceId });
  const {
    mutate: deleteMember,
    isPending: isDeletingMember
  } = useDeleteMember();
  const {
    mutate: updateMember,
    isPending: isUpdatingMember
  } = useUpdateMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember({ param: { memberId } }, {
      onSuccess: () => {
        window.location.reload();
      },
    });
  }

  return (
    <Card className="w-full rounded-xl border border-navy/10 bg-ivory shadow-sm shadow-navy/[0.025]">
      <ConfirmDialog />
      {workspace && (
      <InviteWorkspaceModal
        workspace={workspace}
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
      />
    )}
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/workspaces/${workspaceId}`}>
            <ArrowLeftIcon className="size-4 mr-2" />
            Back
          </Link>
        </Button>
        <CardTitle className="font-display text-xl font-bold text-navy">
          Members list
        </CardTitle>
      </CardHeader>
      <Button
        className="ml-auto"
        size="sm"
        onClick={() => setIsInviteModalOpen(true)}
        disabled={isWorkspaceLoading || !workspace}>
        <PlusIcon className="mr-2 size-4" />
        Invite Members
      </Button>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {isLoading ? (
          <div className="space-y-3" aria-label="Loading workspace members">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14 rounded-lg bg-navy/10" />
            ))}
          </div>
        ) : isError ? (
          <p role="alert" className="rounded-lg border border-navy/10 bg-navy/[0.025] px-4 py-6 text-center text-sm text-navy/65">
            We couldn&apos;t load workspace members. Please refresh to try again.
          </p>
        ) : data?.documents.length ? data.documents.map((member, index) => (
          <Fragment key={member.$id}>
            <div className="flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-navy/[0.025]">
              <MemberAvatar
                className="size-10"
                fallbackClassName="text-lg"
                name={member.name}
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium text-navy">{member.name}</p>
                <p className="text-xs text-navy/55">{member.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="ml-auto"
                    variant="secondary"
                    size="icon"
                  >
                    <MoreVerticalIcon className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
                    disabled={isUpdatingMember}
                  >
                    Set as Administrator
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)}
                    disabled={isUpdatingMember}
                  >
                    Set as Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium text-navy"
                    onClick={() => handleDeleteMember(member.$id)}
                    disabled={isDeletingMember}
                  >
                    Remove {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {index < data.documents.length - 1 && (
              <Separator className="my-2.5" />
            )}
          </Fragment>
        )) : (
          <div className="rounded-lg border border-dashed border-navy/20 bg-navy/[0.025] px-5 py-10 text-center">
            <p className="font-medium text-navy">No workspace members found</p>
            <p className="mt-1 text-sm text-navy/55">Members will appear here once they join this workspace.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
