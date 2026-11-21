"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const WorkspaceSwitcher = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const { data: workspaces } = useGetWorkspaces();
  const { open } = useCreateWorkspaceModal();

  const onSelect = (id: string) => {
    router.push(`/workspaces/${id}`);
  };

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/50">Workspace</p>
        <button type="button" aria-label="Create workspace" onClick={open} className="rounded-md p-1 text-ivory/55 transition hover:bg-ivory/10 hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne">
          <Plus className="size-4" />
        </button>
      </div>
      <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="h-11 w-full rounded-lg border-ivory/20 bg-ivory/5 px-2.5 font-medium text-ivory shadow-none transition hover:bg-ivory/10 focus:ring-champagne [&>svg]:text-ivory/50">
          <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
          {workspaces?.documents.map((workspace) => (
            <SelectItem key={workspace.$id} value={workspace.$id}>
              <div className="flex justify-start items-center gap-3 font-medium">
                <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
                <span className="truncate">{workspace.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
