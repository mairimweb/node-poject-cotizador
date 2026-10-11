import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthContext';
import styles from './login.module.css';

export function LoginDialog() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <form className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="auth-title" onSubmit={handleSubmit}>
        <h1 className={styles.title} id="auth-title">
          Acceso al cotizador
        </h1>
        <p className={styles.subtitle}>Ingresá tu correo y contraseña para continuar.</p>

        <label className={styles.field}>
          <span className={styles.label}>Correo electrónico</span>
          <input
            className={styles.input}
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Contraseña</span>
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Verificando…' : 'Ingresar'}
        </button>

        {error && (
          <p className={`${styles.message} ${styles.error}`} role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}