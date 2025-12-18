import { useLanguage } from '@/shared/hooks/useLanguage';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SettingsModal } from './SettingsModal';
import { UserAvatar } from './UserAvatar';

interface MobileTab {
  id: string;
  label: string;
  path: string;
}

export function MobileHeader() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAvatarClick = () => {
    setIsSettingsOpen(true);
  };

  const tabs: MobileTab[] = [
    {
      id: 'resumidor',
      label: language.sidebar.agent.summarizer,
      path: '/resumidor',
    },
    {
      id: 'tradutor',
      label: language.sidebar.agent.translator,
      path: '/tradutor',
    },
    {
      id: 'auxiliar',
      label: language.sidebar.agent.studyHelper,
      path: '/auxiliar-estudo',
    },
  ];

  // Determine active tab based on current path
  const activeTabIndex = tabs.findIndex(tab => location.pathname.startsWith(tab.path));
  // Default to 0 if path not found (or handle 404/redirect logic elsewhere)
  const currentTabIndex = activeTabIndex !== -1 ? activeTabIndex : 0;

  const handleTabChange = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">

        {/* CORRECTED HEADER TOP ROW */}
        <div className="flex items-center justify-between px-4 h-16 relative">
          {/* Left: Empty Spacer or Logo? Keep empty for now or put something else? */}
          <div className="w-10 h-10 flex items-center justify-center">
            {/* Empty or maybe a small logo? */}
          </div>

          {/* Center: Title */}
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-base font-semibold text-zinc-900 dark:text-white">
            AI Challenge
          </h1>

          {/* Right: Avatar */}
          <button 
            onClick={handleAvatarClick}
            className="rounded-full hover:ring-2 hover:ring-zinc-200 dark:hover:ring-zinc-600 transition-all duration-150"
          >
            <UserAvatar user={undefined} size={40} />
          </button>
          <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        </div>

        {/* Tabs Section - 48px height */}
        <div className="h-12 relative">
          <div className="flex items-center h-full">
            <div className="flex w-full h-full relative overflow-x-hidden no-scrollbar">
              {tabs.map((tab, index) => {
                const isActive = currentTabIndex === index;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.path)}
                    className={`flex-1 min-w-[33%] px-2 py-2 text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap relative ${isActive
                      ? 'text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                );
              })}

              {/* Animated Tab Indicator */}
              <motion.div
                className="absolute bottom-0 h-0.5 bg-zinc-900 dark:bg-white rounded-full"
                initial={false}
                animate={{
                  left: `${(currentTabIndex * 100) / tabs.length}%`,
                  width: `${100 / tabs.length}%`
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  duration: 0.3
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
