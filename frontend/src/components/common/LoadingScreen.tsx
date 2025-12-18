import { motion } from 'framer-motion';
import '../../styles/global-loading.css';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Carregando..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Loader */}
        <div className="loader"></div>
        
        {/* Text */}
        <div className="text-center">
          <div className="text-2xl font-semibold text-zinc-900 dark:text-white mb-2">
            AI Challenge
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {message}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 