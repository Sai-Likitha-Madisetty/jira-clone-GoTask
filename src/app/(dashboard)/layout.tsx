import { EditTaskModal } from "@/features/tasks/components/edit-task-modal";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return ( 
    <div className="min-h-screen bg-ivory">
      <CreateWorkspaceModal />
      <CreateProjectModal />
      <CreateTaskModal />
      <EditTaskModal />
      <div className="flex w-full h-full">
        <div className="fixed left-0 top-0 hidden h-screen w-[264px] overflow-y-auto lg:block">
          <Sidebar />
        </div>
        <div className="w-full lg:pl-[264px]">
          <div className="mx-auto min-h-screen max-w-screen-2xl">
            <Navbar />
            <main className="flex min-h-[calc(100vh-76px)] flex-col px-4 py-6 sm:px-6 sm:py-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default DashboardLayout;
