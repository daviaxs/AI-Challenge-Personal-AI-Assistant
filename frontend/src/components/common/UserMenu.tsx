import { useLanguage } from '@/shared/hooks/useLanguage';
import { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { UserAvatar } from './UserAvatar';

interface UserMenuProps {
  expanded: boolean;
}

export function UserMenu({ expanded }: UserMenuProps) {
  const { language } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleAvatarClick = () => {
    setIsSettingsOpen(true);
  };

  if (!expanded) {
    return (
      <div className="pb-4 pt-2 px-3 flex items-center justify-center">
        <button 
          onClick={handleAvatarClick}
          className="rounded-full hover:ring-2 hover:ring-zinc-200 dark:hover:ring-zinc-600 transition-all duration-150"
        >
          <UserAvatar user={undefined} size={36} />
        </button>
        <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </div>
    );
  }

  return (
    <div className="pt-2 pb-4 px-3 flex items-center justify-start gap-2">
      <button 
        onClick={handleAvatarClick}
        className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg p-1 transition-all duration-150 w-full"
      >
        <UserAvatar user={undefined} size={36} />
        <p className="text-sm text-zinc-900 dark:text-white font-medium">
          {language.userMenu.defaultUser}
        </p>
      </button>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}
