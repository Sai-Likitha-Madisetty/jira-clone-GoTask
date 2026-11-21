"use client";

import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  FolderKanban,
  ListTodo,
  Plus,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Task, TaskStatus } from "@/features/tasks/types";
import { Member } from "@/features/members/types";
import { Project } from "@/features/projects/types";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { MemberAvatar } from "@/features/members/components/member-avatar";

import { Button } from "@/components/ui/button";
import { PageError } from "@/components/page-error";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();
  const { data: analytics, isLoading: isLoadingAnalytics, isError: isAnalyticsError } =
    useGetWorkspaceAnalytics({ workspaceId });
  const { data: tasks, isLoading: isLoadingTasks, isError: isTasksError } =
    useGetTasks({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects, isError: isProjectsError } =
    useGetProjects({ workspaceId });
  const { data: members, isLoading: isLoadingMembers, isError: isMembersError } =
    useGetMembers({ workspaceId });
  const { data: workspaces } = useGetWorkspaces();

  const isLoading =
    isLoadingAnalytics || isLoadingTasks || isLoadingProjects || isLoadingMembers;
  const hasError =
    isAnalyticsError || isTasksError || isProjectsError || isMembersError;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError || !analytics || !tasks || !projects || !members) {
    return <PageError message="We couldn't load this workspace. Please refresh to try again." />;
  }

  const workspace = workspaces?.documents.find((item) => item.$id === workspaceId);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7">
      <section className="relative overflow-hidden rounded-xl border border-navy bg-navy px-6 py-7 text-ivory shadow-sm sm:px-8 sm:py-8">
        <div className="absolute right-0 top-0 h-full w-1 bg-champagne" />
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ivory/15 bg-ivory/5 px-3 py-1.5 text-xs font-medium text-ivory/80">
              <Sparkles className="size-3.5 text-champagne" />
              Your team workspace
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {workspace?.name ?? "Workspace overview"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ivory/70 sm:text-base">
              The latest on your projects, tasks, and team, so everyone can focus on what moves work forward.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="h-10 border-ivory/20 bg-ivory/5 text-ivory shadow-none hover:bg-ivory/10 hover:text-ivory"
              asChild
            >
              <Link href={`/workspaces/${workspaceId}/tasks`}>
                View tasks
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              className="h-10 border-champagne bg-champagne text-navy shadow-none hover:bg-champagne/90"
              onClick={createTask}
            >
              <Plus className="mr-2 size-4" />
              New task
            </Button>
          </div>
        </div>
      </section>

      {analytics.overdueTaskCount > 0 && (
        <section className="flex flex-col gap-3 rounded-xl border border-champagne/45 bg-champagne/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-champagne" />
            <div>
              <p className="text-sm font-semibold text-navy">Needs attention</p>
              <p className="mt-0.5 text-sm text-navy/65">
                {analytics.overdueTaskCount} {analytics.overdueTaskCount === 1 ? "task created" : "tasks created"} this month {analytics.overdueTaskCount === 1 ? "is" : "are"} overdue.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 self-start border-champagne/50 bg-ivory/70 sm:self-auto">
            <Link href={`/workspaces/${workspaceId}/tasks`}>Review tasks <ArrowRight className="ml-2 size-4" /></Link>
          </Button>
        </section>
      )}

      <MetricGrid data={analytics} projectCount={projects.total} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <TaskList data={tasks.documents} total={tasks.total} />
        <ProjectList data={projects.documents} total={projects.total} />
      </div>

      <MembersList data={members.documents} total={members.total} />
    </div>
  );
};

interface MetricGridProps {
  projectCount: number;
  data: {
    taskCount: number;
    taskDifference: number;
    assignedTaskCount: number;
    assignedTaskDifference: number;
    completedTaskCount: number;
    completedTaskDifference: number;
    overdueTaskCount: number;
    overdueTaskDifference: number;
  };
}

interface MetricCardProps {
  title: string;
  value: number;
  difference: number;
  icon: LucideIcon;
  tone: "indigo" | "emerald" | "violet" | "amber";
  inverseTrend?: boolean;
  caption?: string;
}

const toneStyles = {
  indigo: "bg-navy text-ivory",
  emerald: "bg-champagne/20 text-navy",
  violet: "bg-navy/10 text-navy",
  amber: "bg-champagne/10 text-navy",
};

const MetricCard = ({
  title,
  value,
  difference,
  icon: Icon,
  tone,
  inverseTrend = false,
  caption,
}: MetricCardProps) => {
  const isPositive = inverseTrend ? difference < 0 : difference > 0;
  const TrendIcon = difference < 0 ? ArrowDownRight : ArrowUpRight;
  const trendText = caption ?? (
    difference === 0
      ? "No change from last month"
      : `${Math.abs(difference)} ${difference < 0 ? "fewer" : "more"} than last month`
  );

  return (
    <Card className="group rounded-xl border-navy/10 bg-ivory shadow-sm shadow-navy/[0.025] transition duration-200 hover:-translate-y-0.5 hover:border-champagne/60 hover:shadow-md hover:shadow-navy/[0.05]">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-navy/60">{title}</p>
            <p className="mt-3 font-display text-3xl font-bold tracking-tight text-navy">
              {value.toLocaleString()}
            </p>
          </div>
          <div className={`rounded-xl p-2.5 ${toneStyles[tone]}`}>
            <Icon className="size-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          {!caption && difference !== 0 && (
            <TrendIcon className={`size-4 ${isPositive ? "text-champagne" : "text-navy/40"}`} />
          )}
          <span className={isPositive ? "font-medium text-navy" : "text-navy/55"}>
            {trendText}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricGrid = ({ data, projectCount }: MetricGridProps) => (
  <section aria-label="Workspace metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
    <MetricCard title="Projects" value={projectCount} difference={0} icon={FolderKanban} tone="violet" caption="In this workspace" />
    <MetricCard title="Tasks created" value={data.taskCount} difference={data.taskDifference} icon={ListTodo} tone="indigo" />
    <MetricCard title="Completed" value={data.completedTaskCount} difference={data.completedTaskDifference} icon={CheckCircle2} tone="emerald" />
    <MetricCard title="Assigned to you" value={data.assignedTaskCount} difference={data.assignedTaskDifference} icon={Users} tone="violet" />
    <MetricCard title="Overdue" value={data.overdueTaskCount} difference={data.overdueTaskDifference} icon={CircleDashed} tone="amber" inverseTrend />
  </section>
);

interface TaskListProps {
  data: Task[];
  total: number;
}

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "Backlog",
  [TaskStatus.TODO]: "To do",
  [TaskStatus.IN_PROGRESS]: "In progress",
  [TaskStatus.IN_REVIEW]: "In review",
  [TaskStatus.DONE]: "Done",
};

const TaskList = ({ data, total }: TaskListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();
  const visibleTasks = data.slice(0, 5);

  return (
    <section className="rounded-xl border border-navy/10 bg-ivory p-5 shadow-sm shadow-navy/[0.025] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold tracking-tight text-navy">Recent tasks</h3>
            <Badge variant="secondary" className="rounded-full px-2">{total}</Badge>
          </div>
          <p className="mt-1 text-sm text-navy/55">The latest work across your workspace</p>
        </div>
        <Button size="icon" variant="outline" aria-label="Create task" onClick={createTask} className="size-9 rounded-lg border-navy/15 text-navy/70 hover:border-champagne/60 hover:bg-champagne/10 hover:text-navy">
          <Plus className="size-4" />
        </Button>
      </div>

      {visibleTasks.length ? (
        <ul className="mt-5 divide-y divide-navy/10">
          {visibleTasks.map((task) => (
            <li key={task.$id}>
              <Link
                href={`/workspaces/${workspaceId}/tasks/${task.$id}`}
                className="group flex items-center justify-between gap-4 rounded-lg px-2 py-3.5 transition hover:bg-navy/[0.035]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy transition group-hover:text-navy/70">{task.name}</p>
                  <p className="mt-1 truncate text-xs text-navy/55">{task.project?.name ?? "No project"} <span className="mx-1.5 text-champagne">/</span> Due {formatDistanceToNowStrict(new Date(task.dueDate), { addSuffix: true })}</p>
                </div>
                <Badge variant={task.status} className="shrink-0 rounded-full border-0 px-2.5 font-medium">
                  {statusLabels[task.status]}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="A clear runway"
          description="Create a task to turn your next idea into progress."
          action={<Button size="sm" onClick={createTask}><Plus className="mr-2 size-4" />Create task</Button>}
        />
      )}

      {visibleTasks.length > 0 && (
        <Link href={`/workspaces/${workspaceId}/tasks`} className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-medium text-navy/70 transition hover:border-champagne/60 hover:bg-champagne/10 hover:text-navy">
          View all tasks <ArrowRight className="size-4" />
        </Link>
      )}
    </section>
  );
};

interface ProjectListProps {
  data: Project[];
  total: number;
}

const ProjectList = ({ data, total }: ProjectListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <section className="rounded-xl border border-navy/10 bg-ivory p-5 shadow-sm shadow-navy/[0.025] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold tracking-tight text-navy">Projects</h3>
            <Badge variant="secondary" className="rounded-full px-2">{total}</Badge>
          </div>
          <p className="mt-1 text-sm text-navy/55">Projects in this workspace</p>
        </div>
        <Button size="icon" variant="outline" aria-label="Create project" onClick={createProject} className="size-9 rounded-lg border-navy/15 text-navy/70 hover:border-champagne/60 hover:bg-champagne/10 hover:text-navy">
          <Plus className="size-4" />
        </Button>
      </div>

      {data.length ? (
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.slice(0, 4).map((project) => (
            <li key={project.$id}>
              <Link
                href={`/workspaces/${workspaceId}/projects/${project.$id}`}
                className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-navy/10 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-champagne/60 hover:bg-champagne/5 hover:shadow-md hover:shadow-navy/[0.04]"
              >
                <ProjectAvatar className="size-10 rounded-lg" fallbackClassName="rounded-lg text-base" name={project.name} image={project.imageUrl} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy transition group-hover:text-navy/70">{project.name}</p>
                  <p className="mt-0.5 text-xs text-navy/55">Open project</p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 text-navy/30 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-champagne" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="Bring work together"
          description="Start a project to give your team a shared place to plan."
          action={<Button size="sm" onClick={createProject}><Plus className="mr-2 size-4" />Create project</Button>}
        />
      )}
    </section>
  );
};

interface MembersListProps {
  data: Member[];
  total: number;
}

const MembersList = ({ data, total }: MembersListProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <section className="rounded-xl border border-navy/10 bg-ivory p-5 shadow-sm shadow-navy/[0.025] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold tracking-tight text-navy">Your team</h3>
            <Badge variant="secondary" className="rounded-full px-2">{total}</Badge>
          </div>
          <p className="mt-1 text-sm text-navy/55">The people making things happen</p>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-lg border-navy/15 text-navy/70 hover:border-champagne/60 hover:bg-champagne/10 hover:text-navy">
          <Link href={`/workspaces/${workspaceId}/members`}>Manage members <ArrowRight className="ml-2 size-4" /></Link>
        </Button>
      </div>

      {data.length ? (
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.slice(0, 6).map((member) => (
            <li key={member.$id} className="flex min-w-0 items-center gap-3 rounded-lg border border-navy/10 bg-ivory p-3">
              <MemberAvatar className="size-10 border-0" fallbackClassName="bg-champagne/15 text-sm text-navy shadow-sm" name={member.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy">{member.name}</p>
                <p className="truncate text-xs text-navy/55">{member.email}</p>
              </div>
              <Badge variant="outline" className={`shrink-0 rounded-full px-2 text-[10px] ${member.role === "ADMIN" ? "border-champagne/50 bg-champagne/15 text-navy" : "border-navy/15 bg-ivory text-navy/55"}`}>
                {member.role === "ADMIN" ? "Admin" : "Member"}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          title="Better work, together"
          description="Invite teammates to collaborate in this workspace."
          action={<Button size="sm" asChild><Link href={`/workspaces/${workspaceId}/members`}>Invite teammates</Link></Button>}
        />
      )}
    </section>
  );
};

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action: React.ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="my-5 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-navy/20 bg-ivory px-5 py-7 text-center">
    <div className="rounded-lg bg-champagne/15 p-3 text-navy shadow-sm ring-1 ring-navy/10">
      <Icon className="size-5" />
    </div>
    <p className="mt-3 text-sm font-semibold text-navy">{title}</p>
    <p className="mt-1 max-w-xs text-xs leading-5 text-navy/55">{description}</p>
    <div className="mt-4">{action}</div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-7">
    <Skeleton className="h-56 w-full rounded-xl bg-navy/10" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-36 rounded-xl bg-navy/10" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Skeleton className="h-[360px] rounded-xl bg-navy/10" />
      <Skeleton className="h-[360px] rounded-xl bg-navy/10" />
    </div>
    <Skeleton className="h-56 rounded-xl bg-navy/10" />
  </div>
);
