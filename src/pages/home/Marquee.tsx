export function Marquee({ items, dark = true }: { items: string[]; dark?: boolean }) {
  const row = (
    <>
      {items.map((t, i) => (
        <span key={i} className="marquee__item">
          {t}
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
          </svg>
        </span>
      ))}
    </>
  );
  return (
    <div className={`band ${dark ? 'band--dark on-dark' : 'band--chile on-dark'}`} aria-hidden>
      <div className="marquee">
        <div className="marquee__track display">{row}</div>
        <div className="marquee__track display">{row}</div>
      </div>
    </div>
  );
}
