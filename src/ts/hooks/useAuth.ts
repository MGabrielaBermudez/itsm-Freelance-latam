import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/context/AuthContext';

/** Acceso tipado a la sesión y a las acciones de autenticación. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return context;
}
