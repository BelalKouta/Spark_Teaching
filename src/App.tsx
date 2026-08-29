import { useRoute } from '@/lib/router';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/pages/HomePage';
import { BookPage } from '@/pages/BookPage';
import { ConfirmationPage } from '@/pages/ConfirmationPage';
import { AdminPage } from '@/pages/AdminPage';
import { AssistantPortalPage } from '@/pages/AssistantPortal';

function App() {
  const route = useRoute();

  return (
    <div className="min-h-screen bg-ink-base">
      <Navbar />
      {route.name === 'home' && <HomePage />}
      {route.name === 'book' && <BookPage />}
      {route.name === 'confirmation' && <ConfirmationPage />}
      {route.name === 'admin' && <AdminPage />}
      {route.name === 'assistantLogin' && <AssistantPortalPage />}
      {route.name === 'assistantDashboard' && <AssistantPortalPage />}
    </div>
  );
}

export default App;
