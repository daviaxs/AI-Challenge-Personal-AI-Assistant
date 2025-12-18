import { useLanguage, useTheme } from '@/shared/hooks';
import { Check, ChevronDown, Monitor, Moon, Settings as SettingsIcon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { UserAvatar } from './UserAvatar';



interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab = 'general';

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { language } = useLanguage();

  const tabs = [
    { id: 'general' as const, label: language.settingsModal.tabs.general, icon: SettingsIcon },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false}
        className=""
      >
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col h-full w-full max-h-full bg-white dark:bg-zinc-700">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-600 flex-shrink-0 bg-white dark:bg-zinc-700">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {language.settingsModal.title}
            </h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Mobile Tabs */}
          <div className="flex overflow-x-auto min-h-[48px] max-h-[48px] border-b border-zinc-200 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800/70 flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white border-b-2 border-cyan-500'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto w-full min-h-[400px] max-h-[400px] bg-white dark:bg-zinc-700 custom-scrollbar">
            <div className="p-4 w-full">
              {renderTabContent(activeTab, language)}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-full w-fit ">
          {/* Left Sidebar - 200px */}
          <div className="w-[200px] flex-shrink-0 bg-zinc-50 dark:bg-zinc-700/70 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 dark:border-zinc-800 flex-shrink-0">
              <button
                onClick={() => onOpenChange(false)}
                className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Navigation */}
            <div className="p-2 flex-1 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
                      isActive
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-left">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content - 480px */}
          <div className="w-[480px] h-[500px] flex-shrink-0 flex flex-col bg-white dark:bg-zinc-700 max-h-full overflow-y-auto">
            {/* Content Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  return (
                    <>
                      <div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                          {activeTabData?.label}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          {getTabDescription(activeTab, language)}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 w-full overflow-y-auto p-4 min-h-0 custom-scrollbar">
              {renderTabContent(activeTab, language)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getTabDescription(tab: string, language: any): string {
  switch (tab) {
    case 'general': return language.settingsModal.descriptions.general;
    default: return '';
  }
}

function renderTabContent(activeTab: string, language: any) {
  switch (activeTab) {
    case 'general':
      return <GeneralSettings language={language} />;
    default:
      return <GeneralSettings language={language} />;
  }
}

function GeneralSettings({ language }: { language: any }) {
  const { theme, setTheme } = useTheme();
  const { currentLanguage, setLanguage } = useLanguage();

  const themeOptions = [
    {
      value: 'light' as const,
      label: language.settingsModal.general.theme.options.light.label,
      icon: Sun,
      description: language.settingsModal.general.theme.options.light.description,
      preview: 'bg-white border-zinc-300'
    },
    {
      value: 'dark' as const,
      label: language.settingsModal.general.theme.options.dark.label,
      icon: Moon,
      description: language.settingsModal.general.theme.options.dark.description,
      preview: 'bg-zinc-900 border-zinc-600'
    },
    {
      value: 'system' as const,
      label: language.settingsModal.general.theme.options.system.label,
      icon: Monitor,
      description: language.settingsModal.general.theme.options.system.description,
      preview: 'bg-gradient-to-br from-white to-zinc-900 border-zinc-400'
    },
  ];

  const languageOptions = [
    { 
      value: 'pt-BR' as const, 
      label: 'Português (Brasil)', 
      flag: '🇧🇷',
      native: 'Português'
    },
    { 
      value: 'en' as const, 
      label: 'English', 
      flag: '🇺🇸',
      native: 'English'
    },
  ];

  const currentLangOption = languageOptions.find(lang => lang.value === currentLanguage) || languageOptions[0];

  return (
    <div className="space-y-6 w-full">
      {/* Tema */}
      <div className="w-full">
        <h3 className="text-base font-medium text-zinc-900 dark:text-white mb-1">
          {language.settingsModal.general.theme.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          {language.settingsModal.general.theme.description}
        </p>
        
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`group relative p-3 rounded-lg border transition-all duration-200 ${
                  isActive
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-400/10'
                    : 'border-zinc-100 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-500'
                }`}
              >
                {/* Desktop Layout */}
                <div className="hidden lg:flex flex-col items-center space-y-2">
                  <Icon size={16} className={isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-500 dark:text-zinc-400'} />
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-zinc-900 dark:text-white'}`}>
                      {option.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {option.description}
                    </div>
                  </div>
                </div>
                
                {/* Mobile Layout */}
                <div className="lg:hidden flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-zinc-500 dark:text-zinc-400'} />
                    <div className="text-left">
                      <div className={`text-sm font-medium ${isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-zinc-900 dark:text-white'}`}>
                        {option.label}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Idioma */}
      <div className="w-full">
        <h3 className="text-base font-medium text-zinc-900 dark:text-white mb-1">
          {language.settingsModal.general.language.title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          {language.settingsModal.general.language.description}
        </p>
        
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600 rounded-lg hover:border-zinc-200 dark:hover:border-zinc-500 transition-colors focus:outline-none">
              <div className="flex items-center gap-3">
                <span className="text-lg">{currentLangOption.flag}</span>
                <div className="text-left">
                  <div className="font-medium text-zinc-900 dark:text-white text-sm">
                    {currentLangOption.label}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {currentLangOption.native}
                  </div>
                </div>
              </div>
              <ChevronDown size={16} className="text-zinc-500 dark:text-zinc-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-1" align="start">
            <div className="space-y-1">
              {languageOptions.map((option) => {
                const isActive = currentLanguage === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setLanguage(option.value)}
                    className={`w-full flex items-center gap-2 p-2 rounded-md transition-colors ${
                      isActive
                        ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white'
                    }`}
                  >
                    <span className="text-sm">{option.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">
                        {option.label}
                      </div>
                    </div>
                    {isActive && (
                      <Check size={14} className="text-zinc-600 dark:text-zinc-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// function SecuritySettings({ language }: { language: any }) {
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const passwordFields = [
//     {
//       id: 'current',
//       label: language.settingsModal.security.changePassword.fields.current,
//       placeholder: language.settingsModal.security.changePassword.placeholders.current,
//       showPassword: showCurrentPassword,
//       setShowPassword: setShowCurrentPassword
//     },
//     {
//       id: 'new',
//       label: language.settingsModal.security.changePassword.fields.new,
//       placeholder: language.settingsModal.security.changePassword.placeholders.new,
//       showPassword: showNewPassword,
//       setShowPassword: setShowNewPassword
//     },
//     {
//       id: 'confirm',
//       label: language.settingsModal.security.changePassword.fields.confirm,
//       placeholder: language.settingsModal.security.changePassword.placeholders.confirm,
//       showPassword: showConfirmPassword,
//       setShowPassword: setShowConfirmPassword
//     }
//   ];

//   return (
//     <div className="space-y-6 w-full">
//       <div className="w-full">
//         <h3 className="text-base font-medium text-zinc-900 dark:text-white mb-1">
//           {language.settingsModal.security.changePassword.title}
//         </h3>
//         <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
//           {language.settingsModal.security.changePassword.description}
//         </p>
        
//         <div className="space-y-3 w-full">
//           {passwordFields.map((field) => (
//             <div key={field.id}>
//               <label className="block text-[12px] font-normal text-zinc-700 dark:text-zinc-300 mb-1">
//                 {field.label}
//               </label>
//               <div className="relative">
//                 <input
//                   type={field.showPassword ? 'text' : 'password'}
//                   className="w-full px-3 py-2 pr-10 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 focus:border-zinc-200 transition-all text-sm"
//                   placeholder={field.placeholder}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => field.setShowPassword(!field.showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
//                 >
//                   {field.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
//             </div>
//           ))}

//           <button className="w-full mt-4 px-4 py-2 bg-zinc-500 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg font-medium transition-colors text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500">
//             {language.settingsModal.security.changePassword.button}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
