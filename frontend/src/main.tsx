import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import './index.css'
import { LanguageProvider } from './shared/contexts/LanguageContext.tsx'
import { ThemeProvider } from './shared/contexts/ThemeContext.tsx'

const AppWrapper = () => {
  useEffect(() => {
    // Simula carregamento da aplicação
    const initApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s mínimo
      
      const initialLoader = document.getElementById('initial-loading');
      if (initialLoader) {
        initialLoader.style.opacity = '0';
        setTimeout(() => {
          initialLoader.remove();
        }, 300);
      }
    };

    initApp();
  }, []);

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider delayDuration={0}>
          <AppWrapper />
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
