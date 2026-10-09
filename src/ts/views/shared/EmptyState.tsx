export function EmptyState({ title, desc, children }: { title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="state">
      <div className="state__icon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="state__title">{title}</h3>
      <p className="state__desc">{desc}</p>
      {children}
    </div>
  );
}