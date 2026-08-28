export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,20}$/;

export const PASSWORD_VALIDATION_MESSAGE =
  'Пароль має містити латинські літери верхнього та нижнього регістру та хоча б одну цифру (8–20 символів).';

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Введіть пароль';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return PASSWORD_VALIDATION_MESSAGE;
  }
  return undefined;
}

export function validateEmail(email: string): string | undefined {
  if (!email) {
    return 'Введіть email';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Невірний формат email';
  }
  return undefined;
}
