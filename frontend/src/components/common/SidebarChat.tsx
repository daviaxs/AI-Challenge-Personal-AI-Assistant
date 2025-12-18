import { SIDEBAR_CHAT_KEY } from "@/shared/constants";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { motion } from "framer-motion";
import { FileText, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ButtonPrimary } from "./ButtonPrimary";
import { UserMenu } from "./UserMenu";

// Hook personalizado para obter o estado da sidebar do localStorage
function useSidebarState(): [boolean, (value: boolean) => void] {
  // Obtém o valor inicial do localStorage
  const getInitialState = (): boolean => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_CHAT_KEY);
      return savedState ? JSON.parse(savedState) === true : true; // Default para true (expandido)
    }
    return true; // Default para true (expandido)
  };

  const [expanded, setExpanded] = useState<boolean>(getInitialState);

  // Salva no localStorage quando o estado muda
  useEffect(() => {
    localStorage.setItem(SIDEBAR_CHAT_KEY, JSON.stringify(expanded));
  }, [expanded]);

  return [expanded, setExpanded];
}

export function SidebarChat() {
  const [expanded, setExpanded] = useSidebarState();
  const textRef = useRef<HTMLDivElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const headerTitleStyle = 'text-[16px] text-zinc-900 dark:text-white font-normal whitespace-nowrap';

  // Mede a largura do texto
  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.scrollWidth);
    }
  }, [language.sidebar.agent.title]);

  // Configuração da animação
  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 35,
    mass: 0.8,
    restDelta: 0.001,
    restSpeed: 0.001
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.aside
      animate={{ width: expanded ? 280 : 64 }}
      initial={{ width: expanded ? 280 : 64 }}
      transition={springTransition}
      className="pt-2 flex flex-col h-full"
      style={{
        minWidth: 64,
        position: "relative",
        overflow: "hidden",
        willChange: "width"
      }}
    >
      {/* Header */}
      <div className="px-3 flex items-center justify-between">
        <motion.div
          className="overflow-hidden h-10 flex items-center"
          initial={{ width: expanded ? textWidth + 8 : 0, marginRight: expanded ? 8 : 0 }}
          animate={{
            width: expanded ? textWidth + 8 : 0,
            marginRight: expanded ? 8 : 0
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 1, 0.5, 1]
          }}
        >
          <motion.div
            ref={textRef}
            className="flex items-center"
            initial={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : -10 }}
            animate={{
              opacity: expanded ? 1 : 0,
              x: expanded ? 0 : -10
            }}
            transition={{
              opacity: {
                duration: expanded ? 0.2 : 0.1,
                delay: expanded ? 0.1 : 0
              },
              x: {
                duration: 0.2,
                ease: "easeOut"
              }
            }}
          >
            {/* Header Title Changed as requested */}
            <p className={headerTitleStyle}>
              {language.sidebar.agent.title}
            </p>
          </motion.div>
        </motion.div>

        <ButtonPrimary
          icon="SidebarClose"
          expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          iconFlipped={expanded}
        />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-4 flex-1 overflow-hidden mt-4 h-full">

        {/* Resumidor de Texto */}
        <ButtonPrimary
          lucideIcon={FileText}
          expanded={expanded}
          text={language.sidebar.agent.summarizer}
          color="emerald"
          onClick={() => navigate('/resumidor')}
          active={isActive('/resumidor')}
        />

        {/* Tradutor */}
        <ButtonPrimary
          lucideIcon={Languages}
          expanded={expanded}
          text={language.sidebar.agent.translator}
          color="cyan"
          onClick={() => navigate('/tradutor')}
          active={isActive('/tradutor')}
        />

        {/* Study Helper - Updated Icon and Route */}
        <ButtonPrimary
          icon="Quiz"
          expanded={expanded}
          text={language.sidebar.agent.studyHelper}
          color="red"
          onClick={() => navigate('/auxiliar-estudo')}
          active={isActive('/auxiliar-estudo')}
        />

      </div>

      {/* Footer */}
      <UserMenu expanded={expanded} />
    </motion.aside>
  )
}