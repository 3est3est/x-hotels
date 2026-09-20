/**
 * Document-number validation for identity verification (Spec 0003).
 * Nothing is uploaded: the number itself is the verification.
 */

const THAI_NATIONAL_ID_LENGTH = 13
const TEUDAT_ZEHUT_LENGTH = 9
const PASSPORT_MIN = 5
const PASSPORT_MAX = 15

function digitsOnly(value: string): string {
  return value.replaceAll(/[\s-]/g, '')
}

/**
 * Thai national ID: 13 digits with a mod-11 check digit.
 * Check = sum(digit[i] * (13 - i)) for 0-based i in 0..11, mod 11; digit13 = (1 - check) mod 10.
 */
export function isValidThaiNationalId(value: string): boolean {
  const digits = digitsOnly(value)
  if (!/^\d{13}$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 12; i++) sum += Number(digits[i]) * (THAI_NATIONAL_ID_LENGTH - i)
  const check = (1 - (sum % 11) + 10) % 10
  return Number(digits[12]) === check
}

/** Israeli Teudat Zehut: 9 digits with a weighted check digit (1,2,1,2,... ; >=10 → digit sum). */
export function isValidTeudatZehut(value: string): boolean {
  const digits = digitsOnly(value)
  if (!/^\d{9}$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < TEUDAT_ZEHUT_LENGTH - 1; i++) {
    const weighted = Number(digits[i]) * ((i % 2) + 1)
    sum += weighted > 9 ? weighted - 9 : weighted
  }
  const check = (10 - (sum % 10)) % 10
  return Number(digits[8]) === check
}

/** Passport of any nationality: 5–15 alphanumeric characters, case-insensitive. */
export function isValidPassportNumber(value: string): boolean {
  return new RegExp(`^[A-Z0-9]{${PASSPORT_MIN},${PASSPORT_MAX}}$`).test(value)
}
