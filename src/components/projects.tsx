"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";

export const Projects = () => {
  const pathname = usePathname();
  const { open } = useCreateProjectModal();
  const workspaceId = useWorkspaceId();
  const { data } = useGetProjects({
    workspaceId,
  });

  return (
    <div className="flex h-full flex-col gap-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/50">Projects</p>
        <button type="button" aria-label="Create project" onClick={open} className="rounded-md p-1 text-ivory/55 transition hover:bg-ivory/10 hover:text-champagne focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne">
          <Plus className="size-4" />
        </button>
      </div>
      {data?.documents.length ? data.documents.map((project) => {
        const href = `/workspaces/${workspaceId}/projects/${project.$id}`;
        const isActive = pathname === href;

        return (
          <Link href={href} key={project.$id}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ivory/75 transition-all hover:bg-ivory/10 hover:text-ivory",
                isActive && "bg-ivory/10 text-ivory hover:bg-ivory/10 hover:text-ivory"
              )}
            >
              <ProjectAvatar image={project.imageUrl} name={project.name} />
              <span className="truncate">{project.name}</span>
            </div>
          </Link>
        )
      }) : (
        <div className="mt-1 rounded-lg border border-dashed border-ivory/25 bg-ivory/[0.04] px-3 py-4 text-center">
          <FolderKanban className="mx-auto size-5 text-ivory/40" />
          <p className="mt-2 text-xs font-medium text-ivory/75">No projects yet</p>
          <button type="button" onClick={open} className="mt-1 text-xs font-semibold text-champagne transition hover:text-champagne/80">
            Create your first project
          </button>
        </div>
      )}
    </div>
  );
};
