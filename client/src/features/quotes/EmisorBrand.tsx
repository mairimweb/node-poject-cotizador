import { EMISOR } from '@/domain';

export function EmisorBrand() {
  const websiteHref = EMISOR.website
    ? `https://${EMISOR.website.replace(/^https?:\/\//i, '')}`
    : '';
  return (
    <div className="view-header-emisor">
      <img className="ph-logo" src="/user-logo.png" alt="" />
      <p className="vh-name">{EMISOR.name}</p>
      <p>{EMISOR.cuit}</p>
      <p>{EMISOR.email}</p>
      {EMISOR.website && (
        <p>
          <a className="vh-link" href={websiteHref} target="_blank" rel="noopener noreferrer">
            {EMISOR.website}
          </a>
        </p>
      )}
    </div>
  );
}
