import { AppShell } from '@/components/AppShell';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { LoginDialog } from '@/features/auth/LoginDialog';

function Gate() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <p style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>Cargando…</p>;
  }

  if (status === 'anon') {
    return <LoginDialog />;
  }

  return <AppShell />;
}

export function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}