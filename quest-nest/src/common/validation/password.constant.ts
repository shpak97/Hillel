/** Same length bounds as password reset; upper + lower (latin) + digit; no whitespace. */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)\S{8,20}$/;

export const PASSWORD_VALIDATION_MESSAGE =
  'Пароль має містити латинські літери верхнього та нижнього регістру та хоча б одну цифру (8–20 символів).';
