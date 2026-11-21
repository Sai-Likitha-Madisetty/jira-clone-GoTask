"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";

import { Button } from "@/components/ui/button";
import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";

export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const { data: project, isLoading: isLoadingProject, isError: isProjectError } = useGetProject({ projectId });
  const { data: analytics, isLoading: isLoadingAnalytics, isError: isAnalyticsError } = useGetProjectAnalytics({ projectId });

  const isLoading = isLoadingProject || isLoadingAnalytics;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="h-28 animate-pulse rounded-xl bg-navy/10" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-28 animate-pulse rounded-xl bg-navy/10" />
          <div className="h-28 animate-pulse rounded-xl bg-navy/10" />
          <div className="h-28 animate-pulse rounded-xl bg-navy/10" />
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-navy/10" />
      </div>
    );
  }

  if (isProjectError || isAnalyticsError || !project) {
    return <PageError message="We couldn't load this project. Please refresh to try again." />
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-navy/10 bg-ivory px-5 py-5 shadow-sm shadow-navy/[0.025] sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className="size-11 rounded-lg"
            fallbackClassName="text-lg"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-navy/50">Project workspace</p>
            <h2 className="truncate font-display text-xl font-bold tracking-tight text-navy">{project.name}</h2>
          </div>
        </div>
        <div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}>
              <PencilIcon className="mr-2 size-4 text-champagne" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
      {analytics ? (
        <Analytics data={analytics} />
      ) : null}
      <TaskViewSwitcher hideProjectFilter />
    </div>
  )
};
