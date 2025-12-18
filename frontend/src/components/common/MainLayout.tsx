import { useIsMobile } from "@/shared/hooks/useIsMobile";
import { Outlet } from "react-router-dom";
import { MobileHeader } from "./MobileHeader";
import { SidebarChat } from "./SidebarChat";

export function MainLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="flex w-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden h-screen">
      {!isMobile && (
        <div className="flex-shrink-0 h-full">
          <SidebarChat />
        </div>
      )}

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {isMobile && <MobileHeader />}

        <main className="flex-1 overflow-hidden relative w-full h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
