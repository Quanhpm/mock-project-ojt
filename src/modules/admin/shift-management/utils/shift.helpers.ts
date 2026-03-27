const normalizeMessage = (value: unknown) => {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const parseDateKey = (dateKey: string | null) => {
  if (!dateKey) return null

  const [year, month, day] = dateKey.split('-')
  if (!year || !month || !day) return null

  return new Date(Number(year), Number(month) - 1, Number(day))
}

export const startOfLocalDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const isPastDate = (date: Date, referenceDate = new Date()) => {
  return startOfLocalDay(date) < startOfLocalDay(referenceDate)
}

export const isPastDateKey = (dateKey: string, referenceDate = new Date()) => {
  const parsedDate = parseDateKey(dateKey)
  if (!parsedDate) return false

  return isPastDate(parsedDate, referenceDate)
}

export const extractBackendMessage = (error: unknown, fallbackMessage: string) => {
  if (!error || typeof error !== 'object') {
    return fallbackMessage
  }

  const candidates = [
    (error as {
      response?: {
        data?: {
          message?: unknown
          errors?: Array<{ message?: unknown }> | null
        }
      }
    }).response?.data?.message,
    (error as {
      response?: {
        data?: {
          errors?: Array<{ message?: unknown }> | null
        }
      }
    }).response?.data?.errors?.[0]?.message,
    (error as { message?: unknown }).message,
    (error as {
      data?: {
        message?: unknown
        errors?: Array<{ message?: unknown }> | null
      }
    }).data?.message,
    (error as {
      data?: {
        errors?: Array<{ message?: unknown }> | null
      }
    }).data?.errors?.[0]?.message,
  ]

  for (const candidate of candidates) {
    const message = normalizeMessage(candidate)
    if (message) return message
  }

  return fallbackMessage
}
