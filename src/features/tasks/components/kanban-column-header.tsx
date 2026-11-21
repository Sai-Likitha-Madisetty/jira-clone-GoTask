import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  PlusIcon,
} from "lucide-react";

import { snakeCaseToTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { TaskStatus } from "../types";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";

interface KanbanColumnHeaderProps {
  board: TaskStatus;
  taskCount: number;
};

const statusIconMap: Record<TaskStatus, React.ReactNode> = {
  [TaskStatus.BACKLOG]: (
    <CircleDashedIcon className="size-[18px] text-navy/35" />
  ),
  [TaskStatus.TODO]: (
    <CircleIcon className="size-[18px] text-navy/45" />
  ),
  [TaskStatus.IN_PROGRESS]: (
    <CircleDotDashedIcon className="size-[18px] text-champagne" />
  ),
  [TaskStatus.IN_REVIEW]: (
    <CircleDotIcon className="size-[18px] text-champagne/75" />
  ),
  [TaskStatus.DONE]: (
    <CircleCheckIcon className="size-[18px] text-navy" />
  ),
}

export const KanbanColumnHeader = ({
  board,
  taskCount
}: KanbanColumnHeaderProps) => {
  const { open } = useCreateTaskModal();

  const icon = statusIconMap[board];

  return (
    <div className="px-2 py-1.5 flex items-center justify-between">
      <div className="flex items-center gap-x-2">
        {icon}
        <h2 className="text-sm font-medium">
          {snakeCaseToTitleCase(board)}
        </h2>
        <div className="flex size-5 items-center justify-center rounded-md bg-navy/10 text-xs font-medium text-navy">
          {taskCount}
        </div>
      </div>
      <Button onClick={open} variant="ghost" size="icon" className="size-5">
        <PlusIcon className="size-4 text-navy/50" />
      </Button>
    </div>
  );
};
