import React from "react";
import { useRouter } from "next/navigation";

import { Member } from "@/features/members/types";
import { Project } from "@/features/projects/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { cn } from "@/lib/utils";

import { TaskStatus } from "../types";

interface EventCardProps {
  title: string;
  assignee: Member;
  project: Project;
  status: TaskStatus;
  id: string;
};

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "border-l-navy/25",
  [TaskStatus.TODO]: "border-l-navy/40",
  [TaskStatus.IN_PROGRESS]: "border-l-champagne",
  [TaskStatus.IN_REVIEW]: "border-l-champagne/65",
  [TaskStatus.DONE]: "border-l-navy",
};

export const EventCard = ({
  title,
  assignee,
  project,
  status,
  id,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const onClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();

    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <div onClick={onClick} className={cn(
        "flex cursor-pointer flex-col gap-y-1.5 rounded-lg border border-navy/10 border-l-4 bg-ivory p-2 text-xs text-navy transition hover:bg-champagne/10",
        statusColorMap[status]
      )}>
        <p>{title}</p>
        <div className="flex items-center gap-x-1">
          <MemberAvatar
            name={assignee?.name}
          />
          <div className="size-1 rounded-full bg-champagne" />
          <ProjectAvatar
            name={project?.name}
            image={project?.imageUrl}
          />
        </div>
      </div>
    </div>
  );
};
