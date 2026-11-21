"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Link2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveModal } from "@/components/responsive-modal";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirm } from "@/hooks/use-confirm";

import { Workspace } from "../types";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface InviteWorkspaceModalProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteWorkspaceModal = ({
  workspace,
  open,
  onOpenChange,
}: InviteWorkspaceModalProps) => {
  const [origin, setOrigin] = useState("");
  const { mutate: resetInviteCode, isPending } = useResetInviteCode();
  const [ResetDialog, confirmReset] = useConfirm(
    "Reset invite link",
    "Anyone with the current link will no longer be able to join using it.",
    "destructive",
  );

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const inviteLink = origin
    ? `${origin}/workspaces/${workspace.$id}/join?code=${encodeURIComponent(workspace.inviteCode)}`
    : "";

  const handleCopyLink = async () => {
    if (!inviteLink) {
      toast.error("Invite link is not ready yet");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied");
    } catch {
      toast.error("Could not copy the invite link");
    }
  };

  const handleResetLink = async () => {
    const confirmed = await confirmReset();
    if (!confirmed) return;

    resetInviteCode({ param: { workspaceId: workspace.$id } });
  };

  return (
    <>
      <ResetDialog />
      <ResponsiveModal open={open} onOpenChange={onOpenChange}>
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-navy">
              Invite workspace members
            </DialogTitle>
            <DialogDescription className="text-navy/60">
              Share this link with people you want to add to {workspace.name}.
              Resetting it immediately invalidates the current link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="workspace-invite-link" className="text-sm font-medium text-navy">
              Workspace invite link
            </label>
            <div className="flex gap-2">
              <Input
                id="workspace-invite-link"
                readOnly
                value={inviteLink}
                placeholder="Preparing invite link..."
                className="min-w-0"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                aria-label="Copy workspace invite link"
                disabled={!inviteLink}
                onClick={handleCopyLink}
              >
                <Copy className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-navy/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetLink}
              disabled={isPending}
              className="text-navy"
            >
              <RefreshCw className={`mr-2 size-4 ${isPending ? "animate-spin" : ""}`} />
              Reset invite link
            </Button>
            <div className="flex items-center gap-2 text-xs text-navy/55">
              <Link2 className="size-3.5 text-champagne" />
              Anyone with the link can join
            </div>
          </div>
        </div>
      </ResponsiveModal>
    </>
  );
};
