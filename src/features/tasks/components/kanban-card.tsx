import { MoreHorizontal } from "lucide-react";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

import { DottedSeparator } from "@/components/dotted-separator";

import { TaskDate } from "./task-date";
import { TaskActions } from "./task-actions";

import { Task } from "../types";

interface KanbanCardProps {
  task: Task;
};

export const KanbanCard = ({ task }: KanbanCardProps) => {
  return (
    <div className="mb-2 space-y-3 rounded-lg border border-navy/10 bg-ivory p-3 shadow-sm shadow-navy/[0.03] transition hover:border-champagne/50 hover:shadow-md">
      <div className="flex items-start justify-between gap-x-2">
        <p className="text-sm line-clamp-2">{task.name}</p>
        <TaskActions id={task.$id} projectId={task.projectId}>
          <MoreHorizontal className="size-[18px] shrink-0 text-navy/65 transition hover:text-champagne" />
        </TaskActions>
      </div>
      <DottedSeparator />
      <div className="flex items-center gap-x-1.5">
        <MemberAvatar
          name={task.assignee.name}
          fallbackClassName="text-[10px]"
        />
        <div className="size-1 rounded-full bg-champagne" />
        <TaskDate value={task.dueDate} className="text-xs" />
      </div>
      <div className="flex items-center gap-x-1.5">
        <ProjectAvatar
          name={task.project.name}
          image={task.project.imageUrl}
          fallbackClassName="text-[10px]"
        />
        <span className="truncate text-xs font-medium text-navy/75">{task.project.name}</span>
      </div>
    </div>
  );
};
