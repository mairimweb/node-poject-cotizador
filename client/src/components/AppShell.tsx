import { useAuth } from '@/features/auth/AuthContext';
import { QuoteWorkspace } from '@/features/quotes/QuoteWorkspace';

export function AppShell() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="app-root">
      <header className="app-topbar">
        <h1 className="app-topbar-brand">Cotizador Virtual</h1>
        <div className="app-topbar-user">
          <span className="app-topbar-name">{user.displayName}</span>
          <span className="app-topbar-role">{user.role}</span>
        </div>
      </header>
      <QuoteWorkspace />
    </div>
  );
}
