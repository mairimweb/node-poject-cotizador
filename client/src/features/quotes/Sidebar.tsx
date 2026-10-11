import { CONFIG } from '@/domain';
import type { View } from './quote-model';

interface SidebarProps {
  view: View;
  quotesCount: number;
  onNavigate: (view: View) => void;
  onClearHistory: () => void;
  onLogout: () => void;
}

export function Sidebar({ view, quotesCount, onNavigate, onClearHistory, onLogout }: SidebarProps) {
  const limit = CONFIG.QUOTE_LIMIT;
  const full = quotesCount >= limit;

  return (
    <nav className="sidebar" aria-label="Navegación principal">
      <button
        type="button"
        className={`btn btn-nav${view === 'new' ? ' is-active' : ''}`}
        onClick={() => onNavigate('new')}
      >
        Nueva cotización
      </button>
      <button
        type="button"
        className={`btn btn-nav${view === 'history' ? ' is-active' : ''}`}
        onClick={() => onNavigate('history')}
      >
        Historial <span className="count">{quotesCount}</span>
      </button>
      {view === 'history' && (
        <button
          type="button"
          className="btn btn-nav-clear"
          onClick={onClearHistory}
          disabled={quotesCount === 0}
          title={quotesCount ? '' : 'No hay historial para borrar.'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
          Borrar historial
        </button>
      )}
      <button type="button" className="btn btn-nav-clear" onClick={onLogout}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        Cerrar sesión
      </button>
      <p className="sidebar-limit" role="status">
        {quotesCount} / {limit} slots
        {full ? ' · lleno' : ''}
      </p>
      <p className="sidebar-hint">Las cotizaciones se guardan en tu cuenta.</p>
    </nav>
  );
}
