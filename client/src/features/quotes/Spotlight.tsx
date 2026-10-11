import { EMISOR } from '@/domain';

export function Spotlight() {
  const highlight = EMISOR.highlight;
  if (!highlight || (!highlight.title && !highlight.text)) return null;
  return (
    <aside className="spotlight" role="note">
      {highlight.title && <p className="spotlight-title">{highlight.title}</p>}
      {highlight.text && <p className="spotlight-text">{highlight.text}</p>}
    </aside>
  );
}
