import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/api';
import { AppRouter } from '@/router';
import { AuthProvider } from '@/context/AuthContext';

/* Orden de importación: tokens → base → layout → animaciones → componentes/vistas */
import '@css/tokens.css';
import '@css/base.css';
import '@css/layout.css';
import '@css/animations.css';
import '@css/components/surface.css';
import '@css/components/skeleton.css';
import '@css/components/kpi-card.css';
import '@css/components/charts.css';
import '@css/components/chart-colors.css';
import '@css/components/header.css';
import '@css/components/modal.css';
import '@css/views/dashboard.css';
import '@css/views/inventario.css';
import '@css/login/tokens.css';
import '@css/login/auth-layout.css';
import '@css/login/animated-background.css';
import '@css/login/floating-input.css';
import '@css/login/password-input.css';
import '@css/login/checkbox.css';
import '@css/login/submit-button.css';
import '@css/login/login-form.css';
import '@css/login/demo-accounts.css';
import '@css/login/toast.css';
import '@css/theme.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('No se encontró el contenedor #root en index.html');
}

createRoot(container).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);