import { QueryClientProvider } from '@tanstack/react-query';
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from 'sonner';
import { MainLayout } from './components/common/MainLayout';
import ChatPage from "./pages/private/chat-page/ChatPage";
import { QuizPage } from './pages/private/quiz-page';
import { queryClient } from './shared/lib/queryClient';

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full">
        <Router>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/resumidor" element={<ChatPage />} />
              <Route path="/tradutor" element={<ChatPage />} />
              <Route path="/auxiliar-estudo" element={<QuizPage />} />
            </Route>

            <Route path="/chat" element={<Navigate to="/resumidor" replace />} />
            <Route path="/flashcard" element={<Navigate to="/auxiliar-estudo" replace />} />
            <Route path="/quiz" element={<Navigate to="/auxiliar-estudo" replace />} />

            <Route path="/" element={<Navigate to="/resumidor" replace />} />
            <Route path="*" element={<Navigate to="/resumidor" replace />} />
          </Routes>
        </Router>
      </div>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={4000}
      />
    </QueryClientProvider >
  );
}

export default App;
