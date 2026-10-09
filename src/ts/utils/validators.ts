/**
 * Validadores del formulario de acceso.
 * Funciones puras y tipadas: fáciles de testear y de reutilizar.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 6;

export const isValidEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());

export const isValidPassword = (value: string): boolean => value.length >= MIN_PASSWORD_LENGTH;

/** Devuelve el mensaje de error o `null` si el valor es válido. */
export const validateEmail = (value: string): string | null => {
  if (value.trim().length === 0) return 'Introduce tu correo electrónico';
  if (!isValidEmail(value)) return 'El correo no tiene un formato válido';
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (value.length === 0) return 'Introduce tu contraseña';
  if (!isValidPassword(value)) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
  }
  return null;
};
