export function PageSkeleton() {
  return (
    <div className="page-skeleton container" aria-busy="true" aria-label="Cargando">
      <div className="skeleton" style={{ height: 64, width: '46%', marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 18, width: '30%', marginBottom: 40 }} />
      <div className="page-skeleton__grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ aspectRatio: '4 / 5' }} />
        ))}
      </div>
    </div>
  );
}
