type PhoneMask = {
  code: string
  label: string
  nationalLength: number
  groups: number[]
}

const phoneMasks: PhoneMask[] = [
  { code: "7", label: "Россия или Казахстан", nationalLength: 10, groups: [3, 3, 2, 2] },
  { code: "375", label: "Беларусь", nationalLength: 9, groups: [2, 3, 2, 2] },
  { code: "374", label: "Армения", nationalLength: 8, groups: [2, 3, 3] },
  { code: "994", label: "Азербайджан", nationalLength: 9, groups: [2, 3, 2, 2] },
  { code: "996", label: "Кыргызстан", nationalLength: 9, groups: [3, 3, 3] },
  { code: "373", label: "Молдова", nationalLength: 8, groups: [2, 3, 3] },
  { code: "992", label: "Таджикистан", nationalLength: 9, groups: [2, 3, 2, 2] },
  { code: "993", label: "Туркменистан", nationalLength: 8, groups: [2, 3, 3] },
  { code: "998", label: "Узбекистан", nationalLength: 9, groups: [2, 3, 2, 2] },
]

const blockedPhoneCodes = new Set(["380"])
const maxPhoneDigits = Math.max(...phoneMasks.map((mask) => mask.code.length + mask.nationalLength))

function getDigits(value: string) {
  return value.replace(/\D/g, "")
}

function findPhoneMask(digits: string) {
  return phoneMasks.find((mask) => digits.startsWith(mask.code))
}

function normalizePhoneDigits(value: string, truncate = false) {
  const trimmed = value.trim()
  const hasExplicitCode = trimmed.startsWith("+")
  let digits = getDigits(value)

  if (!digits) return ""

  if (!hasExplicitCode) {
    if (digits.startsWith("8")) {
      digits = `7${digits.slice(1)}`
    } else if (digits.startsWith("9") && digits.length <= 10) {
      digits = `7${digits}`
    }
  }

  if (!truncate) return digits

  const mask = findPhoneMask(digits)
  if (mask) return digits.slice(0, mask.code.length + mask.nationalLength)

  return digits.slice(0, maxPhoneDigits)
}

function formatNationalPart(national: string, groups: number[]) {
  let output = ""
  let offset = 0

  groups.forEach((length, index) => {
    const part = national.slice(offset, offset + length)
    if (!part) return

    if (index === 0) {
      output += ` (${part}${part.length === length ? ")" : ""}`
    } else if (index === 1) {
      output += ` ${part}`
    } else {
      output += `-${part}`
    }

    offset += length
  })

  return output
}

export function formatCisPhone(value: string) {
  const digits = normalizePhoneDigits(value, true)
  if (!digits) return ""

  const mask = findPhoneMask(digits)
  if (!mask) return `+${digits}`

  const national = digits.slice(mask.code.length)
  return `+${mask.code}${formatNationalPart(national, mask.groups)}`
}

export function getCisPhoneValidationError(value: string) {
  const digits = normalizePhoneDigits(value)

  if (!digits) return "Укажите номер телефона"

  if ([...blockedPhoneCodes].some((code) => digits.startsWith(code))) {
    return "Украинские номера не принимаются"
  }

  const mask = findPhoneMask(digits)
  if (!mask) {
    return "Укажите номер СНГ: +7, +375, +374, +994, +996, +373, +992, +993 или +998"
  }

  const expectedLength = mask.code.length + mask.nationalLength
  if (digits.length < expectedLength) return `Укажите телефон полностью: ${mask.label}`
  if (digits.length > expectedLength) return "В номере слишком много цифр"

  return null
}
