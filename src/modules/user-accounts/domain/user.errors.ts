export const UserDomainErrors = {
  ALREADY_CONFIRMED: 'Email is already confirmed',
  INVALID_CODE: 'Confirmation code is incorrect',
  CODE_EXPIRED: 'Confirmation code expired',
  RECOVERY_NOT_REQUESTED: 'Password recovery was not requested',
  RECOVERY_CODE_INCORRECT: 'Recovery code is incorrect',
  RECOVERY_CODE_EXPIRED: 'Recovery code is expired',
} as const;