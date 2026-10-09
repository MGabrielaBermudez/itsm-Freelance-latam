import { SkeletonsKpiGrid } from '@/components/Skeletons';
import { Card } from '@/components/Card';
import { Spinner } from '@/components/Spinner';

export function LoadingView() {
  return (
    <section className="page">
      <header className="page-head">
        <div className="page-head__text">
          <h1 className="page-head__title">Cargando…</h1>
          <p className="page-head__desc">Preparando panel ITSM…</p>
        </div>
      </header>
      <SkeletonsKpiGrid />
      <Card title="Gráficos">
        <div className="state">
          <Spinner />
          <p>Procesando métricas</p>
        </div>
      </Card>
    </section>
  );
}

export function ErrorView({ message }: { message: string }) {
  return (
    <section className="page">
      <header className="page-head">
        <div className="page-head__text">
          <h1 className="page-head__title">No se pudo cargar</h1>
          <p className="page-head__desc">{message}</p>
        </div>
      </header>
      <Card>
        <div className="state state--error">
          <div className="state__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 8v4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="state__title">Ha ocurrido un error</h3>
          <p className="state__desc">Prueba a recargar la página o vuelve en unos segundos.</p>
        </div>
      </Card>
    </section>
  );
}